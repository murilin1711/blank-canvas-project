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
  };
  shipping: number;
  userId: string;
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
      apiVersion: "2025-08-27.basil",
    });

    const body: PaymentIntentRequest = await req.json();
    const { items, customerEmail, customerName, shippingAddress, shipping, userId } = body;

    // Calculate total amount in centavos
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = Math.round((subtotal + shipping) * 100);

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
