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

    const { paymentId, orderId } = await req.json();

    if (!paymentId) {
      throw new Error("paymentId is required");
    }

    console.log("[CHECK-PIX-PAYMENT] Checking payment status:", paymentId);

    // Fetch payment details from Mercado Pago
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("[CHECK-PIX-PAYMENT] Failed to fetch payment:", await response.text());
      throw new Error("Failed to fetch payment details");
    }

    const payment = await response.json();
    const approved = payment.status === "approved";

    console.log("[CHECK-PIX-PAYMENT] Payment status:", payment.status);

    // If approved and we have orderId, update order status in Supabase
    if (approved) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      let resolvedOrderId = orderId;

      if (orderId) {
        const { error } = await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId)
          .eq("status", "pending");

        if (error) {
          console.error("[CHECK-PIX-PAYMENT] Error updating order by id:", error);
        } else {
          console.log("[CHECK-PIX-PAYMENT] Order updated to paid:", orderId);
        }
      } else {
        // Fallback: find by user_id from payment metadata
        const userId = payment.metadata?.user_id;
        if (userId) {
          const { data: orders } = await supabase
            .from("orders")
            .select("id")
            .eq("user_id", userId)
            .eq("payment_method", "pix")
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1);

          if (orders && orders.length > 0) {
            await supabase
              .from("orders")
              .update({ status: "paid" })
              .eq("id", orders[0].id);

            resolvedOrderId = orders[0].id;
            console.log("[CHECK-PIX-PAYMENT] Order updated to paid via userId:", orders[0].id);
          }
        }
      }

      // Se o order pertence a um bolsa_uniforme_payment, marca o frete como pago.
      // Usamos lista (não maybeSingle) porque o fluxo de múltiplos cartões BU pode
      // gerar mais de uma linha com o mesmo order_id — antes isso falhava em silêncio.
      if (resolvedOrderId) {
        const { data: buRecords, error: buFetchError } = await supabase
          .from("bolsa_uniforme_payments")
          .select("id")
          .eq("order_id", resolvedOrderId);

        if (buFetchError) {
          console.error("[CHECK-PIX-PAYMENT] FALHA ao buscar bolsa payments do pedido", resolvedOrderId, buFetchError);
        } else if (buRecords && buRecords.length > 0) {
          const ids = buRecords.map((r) => r.id);
          const { error: buUpdateError } = await supabase
            .from("bolsa_uniforme_payments")
            .update({ shipping_payment_status: "paid" })
            .in("id", ids);
          if (buUpdateError) {
            console.error("[CHECK-PIX-PAYMENT] FALHA ao marcar frete como pago", ids, buUpdateError);
          } else {
            console.log("[CHECK-PIX-PAYMENT] Frete marcado como pago:", ids.join(", "));
          }
        } else {
          console.log("[CHECK-PIX-PAYMENT] Nenhum bolsa payment vinculado ao pedido", resolvedOrderId);
        }
      }

      // Verifica também pelo bolsa_payment_id nos metadados do pagamento MP
      const bolsaPaymentIdFromMeta = payment.metadata?.bolsa_payment_id;
      if (bolsaPaymentIdFromMeta) {
        const { error: metaUpdateError } = await supabase
          .from("bolsa_uniforme_payments")
          .update({ shipping_payment_status: "paid" })
          .eq("id", bolsaPaymentIdFromMeta);
        if (metaUpdateError) {
          console.error("[CHECK-PIX-PAYMENT] FALHA ao marcar frete via metadata", bolsaPaymentIdFromMeta, metaUpdateError);
        } else {
          console.log("[CHECK-PIX-PAYMENT] Frete marcado como pago via metadata:", bolsaPaymentIdFromMeta);
        }
      }

      // Fallback final: external_reference bu-{id} (caso metadata esteja ausente)
      const extRef: string | undefined = payment.external_reference;
      if (extRef?.startsWith("bu-")) {
        const buId = extRef.replace("bu-", "");
        const { error: refUpdateError } = await supabase
          .from("bolsa_uniforme_payments")
          .update({ shipping_payment_status: "paid" })
          .eq("id", buId);
        if (refUpdateError) {
          console.error("[CHECK-PIX-PAYMENT] FALHA ao marcar frete via external_reference", buId, refUpdateError);
        } else {
          console.log("[CHECK-PIX-PAYMENT] Frete marcado como pago via external_reference:", buId);
        }
      }
    }

    return new Response(
      JSON.stringify({
        status: payment.status,
        statusDetail: payment.status_detail,
        approved,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[CHECK-PIX-PAYMENT] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
