// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  quantity: number;
  schoolSlug: string;
}

interface PaymentIntentRequest {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
  };
  shipping: number;
  userId: string;
  shippingMethod?: string;
  bolsaPaymentId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body: PaymentIntentRequest = await req.json();
    const { items, customerEmail, customerName, shippingAddress, shipping, userId, shippingMethod, bolsaPaymentId } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fluxo Bolsa Uniforme: os produtos já cobertos pelos cartões BU nunca devem
    // ser cobrados de novo. Há dois sub-fluxos:
    //  - frete_only: todos os produtos couberam nos cartões BU, falta só o frete.
    //  - bu_remainder: sobrou diferença de produtos (remainder_amount) + frete.
    let totalAmount: number;
    let flow: "frete_only" | "bu_remainder" | "direct_pi";
    let orderId: string | null = null;

    if (bolsaPaymentId) {
      const { data: buPayment, error: buError } = await supabase
        .from("bolsa_uniforme_payments")
        .select("shipping_amount, remainder_amount, order_id")
        .eq("id", bolsaPaymentId)
        .single();
      if (buError || !buPayment) throw new Error("Pagamento Bolsa Uniforme não encontrado");

      const remainderAmount = Number(buPayment.remainder_amount) || 0;
      const shippingAmount = Number(buPayment.shipping_amount) || 0;

      if (remainderAmount > 0) {
        flow = "bu_remainder";
        totalAmount = Math.round((remainderAmount + shippingAmount) * 100);
      } else {
        flow = "frete_only";
        totalAmount = Math.round(shippingAmount * 100);
      }
      orderId = buPayment.order_id ?? null;
    } else {
      flow = "direct_pi";
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalAmount = Math.round((subtotal + shipping) * 100);
    }

    // Grava o pedido (pending) e seus itens no banco ANTES de criar o payment intent,
    // em vez de colocar a lista de itens no metadata do Stripe — metadata tem limite
    // de 500 caracteres por valor e carrinhos com vários produtos estouram esse limite.
    if ((flow === "direct_pi" || flow === "bu_remainder") && !orderId) {
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const { data: createdOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          subtotal,
          shipping,
          total: subtotal + shipping,
          shipping_address: { ...shippingAddress, ...(shippingMethod ? { selected_shipping_method: shippingMethod } : {}) },
          status: "pending",
          payment_method: "card",
        })
        .select()
        .single();
      if (orderError) throw new Error("Erro ao criar pedido: " + orderError.message);
      orderId = createdOrder.id;

      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
      }));
      await supabase.from("order_items").insert(orderItems);

      if (bolsaPaymentId) {
        await supabase.from("bolsa_uniforme_payments").update({ order_id: orderId }).eq("id", bolsaPaymentId);
      }
    }

    console.log("[CREATE-PAYMENT-INTENT] Creating payment intent", {
      totalAmount,
      itemsCount: items.length,
      customerEmail
    });

    // Check if customer exists
    let customerId: string | undefined;
    if (customerEmail) {
      const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("[CREATE-PAYMENT-INTENT] Found existing customer", { customerId });
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: { userId },
        });
        customerId = customer.id;
        console.log("[CREATE-PAYMENT-INTENT] Created new customer", { customerId });
      }
    }

    // Reutiliza payment intent pendente se existir um recente para o mesmo cliente/valor
    if (customerId) {
      const existingPIs = await stripe.paymentIntents.list({ customer: customerId, limit: 10 });
      const reusable = existingPIs.data.find(pi =>
        pi.amount === totalAmount &&
        (pi.status === "requires_payment_method" || pi.status === "requires_confirmation") &&
        pi.metadata?.flow === flow &&
        pi.metadata?.userId === userId &&
        (orderId ? pi.metadata?.orderId === orderId : true)
      );
      if (reusable) {
        console.log("[CREATE-PAYMENT-INTENT] Reusing existing payment intent", reusable.id);
        return new Response(
          JSON.stringify({ clientSecret: reusable.client_secret, paymentIntentId: reusable.id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Create payment intent - using automatic_payment_methods for flexibility
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "brl",
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        customerEmail,
        customerName,
        shipping: shipping.toString(),
        flow,
        ...(shippingMethod ? { shippingMethod } : {}),
        ...(bolsaPaymentId ? { bolsaPaymentId } : {}),
        ...(orderId ? { orderId } : {}),
      },
    });

    console.log("[CREATE-PAYMENT-INTENT] Payment intent created", {
      paymentIntentId: paymentIntent.id
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[CREATE-PAYMENT-INTENT] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
