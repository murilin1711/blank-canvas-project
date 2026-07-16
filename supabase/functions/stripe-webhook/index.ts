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
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
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

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata;

      // Handle bolsa uniforme shipping paid via card (frete_only flow)
      if (metadata?.flow === "frete_only") {
        const bolsaPaymentId = metadata?.bolsaPaymentId;
        if (bolsaPaymentId) {
          await supabase
            .from("bolsa_uniforme_payments")
            .update({ shipping_payment_status: "paid" })
            .eq("id", bolsaPaymentId)
            .neq("shipping_payment_status", "paid");
          console.log("Bolsa frete pago via cartão, bolsaPaymentId:", bolsaPaymentId);
        }
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Marca a diferença Bolsa Uniforme (produtos + frete) como paga
      if (metadata?.flow === "bu_remainder" && metadata?.bolsaPaymentId) {
        await supabase
          .from("bolsa_uniforme_payments")
          .update({ shipping_payment_status: "paid" })
          .eq("id", metadata.bolsaPaymentId)
          .neq("shipping_payment_status", "paid");
      }

      // Only handle direct payment intents created by create-payment-intent
      // (not those created inside a checkout session)
      if (metadata?.flow !== "direct_pi" && metadata?.flow !== "bu_remainder") {
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const orderId = metadata.orderId;
      if (!orderId) {
        console.error("Missing orderId in payment_intent metadata", paymentIntent.id);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Idempotency: skip if this order was already marked paid
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, status, subtotal, shipping, shipping_address")
        .eq("id", orderId)
        .single();
      if (!existingOrder) {
        console.error("Order not found for payment_intent metadata.orderId:", orderId);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (existingOrder.status === "paid") {
        console.log("Order already marked paid, skipping duplicate:", orderId);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: orderError } = await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_method: paymentIntent.payment_method_types?.[0] || "card",
          payment_provider_id: paymentIntent.id,
        })
        .eq("id", orderId);

      if (orderError) {
        console.error("Error updating order (payment_intent.succeeded):", orderError);
        throw orderError;
      }

      console.log("Order marked paid via payment_intent.succeeded:", orderId);

      const userId = metadata.userId;
      const shippingAddress = existingOrder.shipping_address || {};
      const shipping = Number(existingOrder.shipping) || 0;
      const subtotal = Number(existingOrder.subtotal) || 0;

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      for (const item of orderItems ?? []) {
        try {
          const { data: stockRow } = await supabase.from("product_stock").select("id, quantity").eq("product_id", item.product_id).eq("size", item.size).maybeSingle();
          if (stockRow) {
            await supabase.from("product_stock").update({ quantity: Math.max(0, stockRow.quantity - item.quantity), updated_at: new Date().toISOString() }).eq("id", stockRow.id);
          }
        } catch (e: any) { console.error("Stock decrement error:", e); }
      }

      try {
        const userRes = await supabase.auth.admin.getUserById(userId);
        const userEmail = userRes.data?.user?.email;
        const userName = userRes.data?.user?.user_metadata?.name || "";
        if (userEmail) {
          await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
            body: JSON.stringify({
              template: "order_confirmation",
              to: userEmail,
              data: {
                orderId,
                customerName: userName,
                items: (orderItems ?? []).map((i: any) => ({ product_name: i.product_name, product_image: i.product_image, price: i.price, size: i.size, quantity: i.quantity })),
                subtotal,
                shipping,
                total: subtotal + shipping,
                shippingAddress,
              },
            }),
          });
        }
      } catch (emailErr) {
        console.error("Email send failed (non-critical):", emailErr);
      }
    }

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

      // Idempotency: skip if order already exists for this payment intent
      const { data: existingOrderCs } = await supabase
        .from("orders")
        .select("id")
        .eq("payment_provider_id", paymentIntentId)
        .maybeSingle();
      if (existingOrderCs) {
        console.log("Order already exists for payment_intent", paymentIntentId, "— skipping duplicate");
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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
          payment_provider_id: paymentIntentId,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        throw orderError;
      }

      console.log("Order created:", order.id);

      // Busca nome e imagem dos produtos no Supabase (não ficam mais no metadata)
      const productIds = items.map((i: any) => i.id);
      const { data: productRows } = await supabase
        .from("products")
        .select("id, name, images")
        .in("id", productIds);
      const productMap = new Map(
        (productRows ?? []).map((p: any) => [p.id, p])
      );

      // Create order items
      const orderItems = items.map((item: any) => {
        const prod = productMap.get(item.id);
        return {
          order_id: order.id,
          product_id: item.id,
          product_name: prod?.name ?? `Produto #${item.id}`,
          product_image: prod?.images?.[0] ?? null,
          price: item.price,
          size: item.size,
          quantity: item.qty,
        };
      });

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        throw itemsError;
      }

      console.log("Order items created:", orderItems.length);

      // Decrementa estoque
      for (const item of orderItems) {
        try {
          const { data: stockRow } = await supabase.from("product_stock").select("id, quantity").eq("product_id", item.product_id).eq("size", item.size).maybeSingle();
          if (stockRow) {
            await supabase.from("product_stock").update({ quantity: Math.max(0, stockRow.quantity - item.quantity), updated_at: new Date().toISOString() }).eq("id", stockRow.id);
          }
        } catch (e: any) { console.error("Stock decrement error:", e); }
      }

      // Envia email de confirmação
      try {
        const userRes = await supabase.auth.admin.getUserById(userId);
        const userEmail = userRes.data?.user?.email;
        const userName = userRes.data?.user?.user_metadata?.name || "";
        if (userEmail) {
          await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
            body: JSON.stringify({
              template: "order_confirmation",
              to: userEmail,
              data: {
                orderId: order.id,
                customerName: userName,
                items: orderItems.map((i: any) => ({ product_name: i.product_name, product_image: i.product_image, price: i.price, size: i.size, quantity: i.quantity })),
                subtotal,
                shipping,
                total: subtotal + shipping,
                shippingAddress,
              },
            }),
          });
        }
      } catch (emailErr) {
        console.error("Email send failed (non-critical):", emailErr);
      }
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
