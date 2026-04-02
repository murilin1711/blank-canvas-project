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

      if (orderId) {
        // Update specific order by ID
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

            console.log("[CHECK-PIX-PAYMENT] Order updated to paid via userId:", orders[0].id);
          }
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
