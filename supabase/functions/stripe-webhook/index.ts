// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured - use async version
    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Parse event without verification (for testing)
      event = JSON.parse(body);
      console.warn("Webhook signature not verified - configure STRIPE_WEBHOOK_SECRET for production");
    }

    console.log("Received Stripe event:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("Processing completed checkout:", session.id);

      // Get payment intent to retrieve items from its metadata
      const paymentIntentId = session.payment_intent as string;
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      const metadata = paymentIntent.metadata;
      if (!metadata) {
        throw new Error("No metadata found in payment intent");
      }

      const userId = metadata.userId;
      const shippingAddress = JSON.parse(metadata.shippingAddress || "{}");
      const items = JSON.parse(metadata.itemsJson || "[]");
      const shipping = parseFloat(metadata.shipping || "0");

      // Calculate subtotal
      const subtotal = items.reduce(
        (acc: number, item: any) => acc + item.price * item.qty,
        0
      );

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          subtotal,
          shipping,
          total: subtotal + shipping,
          status: "paid",
          payment_method: session.payment_method_types?.[0] || "card",
          shipping_address: shippingAddress,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      console.log("Order created:", order.id);

      // Create order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.img,
        price: item.price,
        size: item.size,
        quantity: item.qty,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        throw itemsError;
      }

      console.log("Order items created:", orderItems.length);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
