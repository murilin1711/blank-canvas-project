// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    const { paymentId } = await req.json();
    
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

    console.log("[CHECK-PIX-PAYMENT] Payment status:", payment.status);

    return new Response(
      JSON.stringify({
        status: payment.status,
        statusDetail: payment.status_detail,
        approved: payment.status === "approved",
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
