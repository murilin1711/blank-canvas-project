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

    // Quando é pagamento do frete Bolsa Uniforme, os produtos já foram pagos no
    // cartão BU — cobrar aqui apenas o frete real (bolsa_uniforme_payments.shipping_amount),
    // nunca subtotal + shipping, senão o cliente é cobrado de novo pelos produtos.
    let totalAmount: number;
    if (bolsaPaymentId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: buPayment, error: buError } = await supabase
        .from("bolsa_uniforme_payments")
        .select("shipping_amount")
        .eq("id", bolsaPaymentId)
        .single();
      if (buError || !buPayment) throw new Error("Pagamento Bolsa Uniforme não encontrado");
      totalAmount = Math.round((Number(buPayment.shipping_amount) || 0) * 100);
    } else {
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      totalAmount = Math.round((subtotal + shipping) * 100);
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
        pi.metadata?.flow === "direct_pi" &&
        pi.metadata?.userId === userId
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
        shippingAddress: JSON.stringify(shippingAddress),
        shipping: shipping.toString(),
        flow: bolsaPaymentId ? "frete_only" : "direct_pi",
        ...(shippingMethod ? { shippingMethod } : {}),
        ...(bolsaPaymentId ? { bolsaPaymentId } : {}),
        items: JSON.stringify(items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
          schoolSlug: item.schoolSlug,
        }))),
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
