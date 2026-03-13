// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const JUMA_API_URL = "https://api.jumaentregas.com.br";

const STORE_ADDRESS = {
  street: "R. Guimarães Natal",
  number: "51",
  neighborhood: "Centro",
  city: "Anápolis",
  state: "GO",
};
const STORE_LAT = -16.3281;
const STORE_LNG = -48.9535;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getJumaToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token;
  }

  const clientId = Deno.env.get("JUMA_CLIENT_ID");
  const secret = Deno.env.get("JUMA_SECRET");

  if (!clientId || !secret) {
    throw new Error("JUMA credentials not configured");
  }

  const response = await fetch(`${JUMA_API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientid: clientId, secret }),
  });

  if (!response.ok) {
    throw new Error(`Juma auth failed: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + (data.expires_in || 7200) * 1000,
  };

  return cachedToken.token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token: authToken, orderId, deliveryAddress } = await req.json();

    // Validate admin/caixa token
    if (!authToken) {
      return new Response(
        JSON.stringify({ error: "Token de autenticação obrigatório" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const decoded = atob(authToken);
    const parts = decoded.split(":");
    const prefix = parts[0];
    const expiresAt = parseInt(parts[1]);
    if ((prefix !== "admin" && prefix !== "caixa") || Date.now() > expiresAt) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
      return new Response(
        JSON.stringify({ error: "Endereço de entrega incompleto" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jumaToken = await getJumaToken();

    // Create delivery request on Juma
    const destResponse = await fetch(`${JUMA_API_URL}/destinations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jumaToken}`,
      },
      body: JSON.stringify({
        drivercategory: 1,
        address: {
          street: deliveryAddress.street,
          number: deliveryAddress.number || "S/N",
          neighborhood: deliveryAddress.neighborhood || "",
          city: deliveryAddress.city,
          state: deliveryAddress.state || "GO",
        },
        latitude: deliveryAddress.latitude || 0,
        longitude: deliveryAddress.longitude || 0,
        description: `Pedido #${orderId?.slice(0, 8) || "N/A"} - Entrega de uniforme`,
        receivername: deliveryAddress.recipientName || "Cliente",
        receiverphone: deliveryAddress.recipientPhone || "",
        placePickup: {
          description: "Loja Genesis Point",
          address: STORE_ADDRESS,
          latitude: STORE_LAT,
          longitude: STORE_LNG,
        },
      }),
    });

    if (!destResponse.ok) {
      const errData = await destResponse.text();
      console.error("Juma dispatch error:", errData);
      return new Response(
        JSON.stringify({ error: "Erro ao solicitar motoboy Juma", details: errData }),
        { status: destResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const destData = await destResponse.json();
    console.log("Juma dispatch result:", JSON.stringify(destData));

    return new Response(
      JSON.stringify({
        success: true,
        message: "Motoboy Juma solicitado com sucesso!",
        deliveryId: destData.id,
        cost: destData.cost,
        duration: destData.durationInfo,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in juma-dispatch:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
