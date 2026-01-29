// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    }

    const body = await req.json();
    console.log("[MERCADOPAGO-WEBHOOK] Received webhook:", JSON.stringify(body));

    // Mercado Pago sends different types of notifications
    // We're interested in payment notifications
    if (body.type !== "payment" && body.action !== "payment.updated") {
      console.log("[MERCADOPAGO-WEBHOOK] Ignoring non-payment notification");
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      console.log("[MERCADOPAGO-WEBHOOK] No payment ID in notification");
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fetch payment details from Mercado Pago
    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      console.error("[MERCADOPAGO-WEBHOOK] Failed to fetch payment:", await paymentResponse.text());
      throw new Error("Failed to fetch payment details");
    }

    const payment = await paymentResponse.json();
    console.log("[MERCADOPAGO-WEBHOOK] Payment status:", payment.status);

    // Only process approved payments
    if (payment.status !== "approved") {
      console.log("[MERCADOPAGO-WEBHOOK] Payment not approved yet:", payment.status);
      return new Response(JSON.stringify({ received: true, status: payment.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user_id from payment metadata
    const userId = payment.metadata?.user_id;
    if (!userId) {
      console.error("[MERCADOPAGO-WEBHOOK] No user_id in payment metadata");
      return new Response(JSON.stringify({ error: "No user_id in metadata" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Find the pending order for this user with pix payment method
    // We look for the most recent pending pix order
    const { data: orders, error: findError } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", userId)
      .eq("payment_method", "pix")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1);

    if (findError || !orders || orders.length === 0) {
      console.error("[MERCADOPAGO-WEBHOOK] Order not found:", findError);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    const orderId = orders[0].id;

    // Update order status to paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    if (updateError) {
      console.error("[MERCADOPAGO-WEBHOOK] Error updating order:", updateError);
      throw updateError;
    }

    console.log("[MERCADOPAGO-WEBHOOK] Order updated to paid:", orderId);

    // Track user activity
    await supabase.from("user_activities").insert({
      user_id: userId,
      activity_type: "payment_confirmed",
      description: `Pagamento Pix confirmado - R$ ${payment.transaction_amount.toFixed(2)}`,
      metadata: {
        payment_id: paymentId,
        order_id: orderId,
        amount: payment.transaction_amount,
      },
    });

    return new Response(
      JSON.stringify({ success: true, orderId }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[MERCADOPAGO-WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
