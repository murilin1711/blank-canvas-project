// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Melhor Envio Sandbox
const MELHOR_ENVIO_API = "https://sandbox.melhorenvio.com.br/api/v2";

// Store origin CEP (Anápolis-GO)
const STORE_CEP = "75020020";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = Deno.env.get("MELHOR_ENVIO_TOKEN");
    if (!token) {
      throw new Error("MELHOR_ENVIO_TOKEN not configured");
    }

    const { destCep, items } = await req.json();

    if (!destCep) {
      return new Response(
        JSON.stringify({ error: "CEP de destino é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate total weight and dimensions from items
    // Default: each item ~300g, 30x25x5cm (uniform package)
    const totalQuantity = (items || []).reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) || 1;
    const weight = Math.max(0.3 * totalQuantity, 0.3); // min 300g
    const height = Math.min(5 + (totalQuantity - 1) * 2, 50); // stacking
    const width = 30;
    const length = 25;
    const totalValue = (items || []).reduce((sum: number, i: any) => sum + (i.price || 50) * (i.quantity || 1), 0) || 50;

    const body = {
      from: { postal_code: STORE_CEP },
      to: { postal_code: destCep.replace(/\D/g, "") },
      products: [
        {
          id: "uniforms",
          width,
          height,
          length,
          weight,
          insurance_value: totalValue,
          quantity: 1,
        },
      ],
    };

    const response = await fetch(`${MELHOR_ENVIO_API}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "GenesisPoint contato@genesispoint.com.br",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Melhor Envio API error:", response.status, errText);
      throw new Error(`Melhor Envio API error [${response.status}]: ${errText}`);
    }

    const data = await response.json();

    // Filter valid options (no errors, with price)
    const options = data
      .filter((s: any) => !s.error && s.price && Number(s.price) > 0)
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        company: s.company?.name || "",
        companyLogo: s.company?.picture || "",
        price: Number(s.price),
        discount: Number(s.discount || 0),
        deliveryDays: s.delivery_time,
        deliveryRange: s.delivery_range ? {
          min: s.delivery_range.min,
          max: s.delivery_range.max,
        } : null,
      }))
      .sort((a: any, b: any) => a.price - b.price);

    return new Response(
      JSON.stringify({ success: true, options }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in melhor-envio-quote:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
