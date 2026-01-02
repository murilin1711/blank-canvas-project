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

interface CheckoutRequest {
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

    const body: CheckoutRequest = await req.json();
    const { items, customerEmail, customerName, shippingAddress, shipping, userId } = body;

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: `${item.productName} - Tam: ${item.size}`,
          images: item.productImage ? [item.productImage] : [],
          metadata: {
            productId: item.productId.toString(),
            size: item.size,
            schoolSlug: item.schoolSlug,
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: {
            name: "Frete",
            images: [],
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || "https://preview--goias-minas-uniformes.lovable.app";

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      line_items: lineItems,
      mode: "payment",
      return_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: customerEmail,
      metadata: {
        userId,
        customerName,
        shippingAddress: JSON.stringify(shippingAddress),
        shipping: shipping.toString(),
      },
      payment_intent_data: {
        metadata: {
          userId,
          customerEmail,
        },
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: session.client_secret }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating embedded checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
