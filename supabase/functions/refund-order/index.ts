// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const mpAccessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, adminToken } = await req.json();

    // Validate admin token
    const validToken = Deno.env.get("ADMIN_TOKEN");
    if (!validToken || adminToken !== validToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order and its items for stock restore
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, total, payment_method, payment_provider_id, status")
      .eq("id", orderId)
      .single();
    const { data: orderItemsForRestore } = await supabase.from("order_items").select("product_id, size, quantity").eq("order_id", orderId);

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.payment_provider_id) {
      return new Response(JSON.stringify({ error: "Pedido sem ID de pagamento registrado. Reembolso manual necessário." }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountCents = Math.round(Number(order.total) * 100);
    const method = order.payment_method;

    // Stripe refund (card / bolsa_uniforme paid via Stripe)
    if (method === "card" || method === "card_present" || (method !== "pix" && order.payment_provider_id.startsWith("pi_"))) {
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2024-06-20",
        httpClient: Stripe.createFetchHttpClient(),
      });

      const refund = await stripe.refunds.create({
        payment_intent: order.payment_provider_id,
        amount: amountCents,
      });

      if (refund.status !== "succeeded" && refund.status !== "pending") {
        throw new Error(`Stripe refund status: ${refund.status}`);
      }

      await supabase.from("orders").update({ status: "refunded" }).eq("id", orderId);

      // Restaura estoque
      if (orderItemsForRestore) {
        for (const item of orderItemsForRestore) {
          try {
            const { data: stockRow } = await supabase.from("product_stock").select("id, quantity").eq("product_id", item.product_id).eq("size", item.size).maybeSingle();
            if (stockRow) await supabase.from("product_stock").update({ quantity: stockRow.quantity + item.quantity, updated_at: new Date().toISOString() }).eq("id", stockRow.id);
          } catch (e) { console.error("Stock restore error:", e); }
        }
      }

      return new Response(JSON.stringify({ success: true, provider: "stripe", refundId: refund.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // MercadoPago refund (pix)
    if (method === "pix") {
      const mpRes = await fetch(
        `https://api.mercadopago.com/v1/payments/${order.payment_provider_id}/refunds`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${mpAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: Number(order.total) }),
        }
      );

      const mpData = await mpRes.json();

      if (!mpRes.ok) {
        throw new Error(mpData.message || "MercadoPago refund failed");
      }

      await supabase.from("orders").update({ status: "refunded" }).eq("id", orderId);

      // Restaura estoque
      if (orderItemsForRestore) {
        for (const item of orderItemsForRestore) {
          try {
            const { data: stockRow } = await supabase.from("product_stock").select("id, quantity").eq("product_id", item.product_id).eq("size", item.size).maybeSingle();
            if (stockRow) await supabase.from("product_stock").update({ quantity: stockRow.quantity + item.quantity, updated_at: new Date().toISOString() }).eq("id", stockRow.id);
          } catch (e) { console.error("Stock restore error:", e); }
        }
      }

      return new Response(JSON.stringify({ success: true, provider: "mercadopago", refundId: mpData.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Método de pagamento não suportado para reembolso automático: ${method}` }), {
      status: 422,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[REFUND-ORDER]", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
