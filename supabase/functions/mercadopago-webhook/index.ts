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

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty or non-JSON body (e.g. verification ping)
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
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

    // ── Resolve o orderId via external_reference (preferencial) ou metadata ──
    const externalRef = payment.external_reference as string | undefined;
    const bolsaPaymentId = payment.metadata?.bolsa_payment_id;
    const metaOrderId = payment.metadata?.order_id;

    let orderId: string | null = null;

    // Tenta via external_reference primeiro (mais confiável)
    if (externalRef?.startsWith("order-")) {
      orderId = externalRef.replace("order-", "");
    } else if (externalRef?.startsWith("bu-")) {
      const buId = externalRef.replace("bu-", "");
      const { data: buPayment } = await supabase
        .from("bolsa_uniforme_payments")
        .select("order_id")
        .eq("id", buId)
        .single();
      orderId = buPayment?.order_id ?? null;
      // Marca frete como pago (idempotente) — aceita null (valor inicial) e pending,
      // mas não sobrescreve caso já esteja "paid"
      await supabase
        .from("bolsa_uniforme_payments")
        .update({ shipping_payment_status: "paid" })
        .eq("id", buId)
        .neq("shipping_payment_status", "paid");
    } else if (bolsaPaymentId) {
      // Fallback para pagamentos antigos sem external_reference
      const { data: buPayment } = await supabase
        .from("bolsa_uniforme_payments")
        .update({ shipping_payment_status: "paid" })
        .eq("id", bolsaPaymentId)
        .select("order_id")
        .single();
      orderId = buPayment?.order_id ?? null;
    } else if (metaOrderId) {
      orderId = metaOrderId;
    } else {
      // Último fallback: order pendente mais recente do usuário
      const { data: orders } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", userId)
        .eq("payment_method", "pix")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);
      orderId = orders?.[0]?.id ?? null;
    }

    if (!orderId) {
      console.error("[MERCADOPAGO-WEBHOOK] Could not resolve orderId");
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Se é frete BU e já atualizou o shipping_payment_status, pode encerrar aqui
    if (externalRef?.startsWith("bu-") || bolsaPaymentId) {
      if (orderId) {
        await supabase
          .from("orders")
          .update({ status: "paid", payment_provider_id: String(paymentId) })
          .eq("id", orderId)
          .eq("status", "pending");
      }
      console.log("[MERCADOPAGO-WEBHOOK] Bolsa frete pago, orderId:", orderId);
      return new Response(JSON.stringify({ success: true, orderId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update order status — só atualiza se ainda pending (evita duplo processamento)
    const { data: updatedRows, error: updateError } = await supabase
      .from("orders")
      .update({ status: "paid", payment_provider_id: String(paymentId) })
      .eq("id", orderId)
      .eq("status", "pending")
      .select("id");

    if (updateError) {
      console.error("[MERCADOPAGO-WEBHOOK] Error updating order:", updateError);
      throw updateError;
    }

    if (!updatedRows || updatedRows.length === 0) {
      console.log("[MERCADOPAGO-WEBHOOK] Order already processed, skipping:", orderId);
      return new Response(JSON.stringify({ success: true, orderId, alreadyProcessed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("[MERCADOPAGO-WEBHOOK] Order updated to paid:", orderId);

    // Decrementa estoque
    const { data: orderItemsForStock } = await supabase.from("order_items").select("product_id, size, quantity").eq("order_id", orderId);
    if (orderItemsForStock) {
      for (const item of orderItemsForStock) {
        try {
          const { data: stockRow } = await supabase.from("product_stock").select("id, quantity").eq("product_id", item.product_id).eq("size", item.size).maybeSingle();
          if (stockRow) {
            await supabase.from("product_stock").update({ quantity: Math.max(0, stockRow.quantity - item.quantity), updated_at: new Date().toISOString() }).eq("id", stockRow.id);
          }
        } catch (e: any) { console.error("Stock decrement error:", e); }
      }
    }

    // Envia email de confirmação
    try {
      const { data: fullOrder } = await supabase.from("orders").select("*, order_items(*)").eq("id", orderId).single();
      const userRes = await supabase.auth.admin.getUserById(userId);
      const userEmail = userRes.data?.user?.email;
      const userName = userRes.data?.user?.user_metadata?.name || "";
      if (userEmail && fullOrder) {
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseServiceKey}` },
          body: JSON.stringify({
            template: "order_confirmation",
            to: userEmail,
            data: {
              orderId,
              customerName: userName,
              items: (fullOrder.order_items || []).map((i: any) => ({ product_name: i.product_name, product_image: i.product_image, price: i.price, size: i.size, quantity: i.quantity })),
              subtotal: fullOrder.subtotal,
              shipping: fullOrder.shipping,
              total: fullOrder.total,
              shippingAddress: fullOrder.shipping_address,
            },
          }),
        });
      }
    } catch (emailErr) {
      console.error("[MERCADOPAGO-WEBHOOK] Email failed (non-critical):", emailErr);
    }

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
