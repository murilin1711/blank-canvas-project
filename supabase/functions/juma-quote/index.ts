// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const JUMA_API_URL = "https://api.jumaentregas.com.br";

// Store address (origin) - R. Guimarães Natal, 51 - Centro, Anápolis - GO
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
  // Return cached token if still valid (with 5min buffer)
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
    const { address, driverCategory } = await req.json();

    if (!address || !address.street || !address.city || !address.state) {
      return new Response(
        JSON.stringify({ error: "Endereço incompleto" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = await getJumaToken();

    // Call destinations endpoint to get quote
    const destResponse = await fetch(`${JUMA_API_URL}/destinations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        drivercategory: driverCategory || 1,
        address: {
          street: address.street,
          number: address.number || "S/N",
          neighborhood: address.neighborhood || "",
          city: address.city,
          state: address.state,
        },
        latitude: address.latitude || 0,
        longitude: address.longitude || 0,
        description: "Entrega de uniforme",
        receivername: address.recipientName || "Cliente",
        receiverphone: address.recipientPhone || "",
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
      console.error("Juma destination error:", errData);
      return new Response(
        JSON.stringify({ error: "Erro ao calcular frete Juma", details: errData }),
        { status: destResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const destData = await destResponse.json();
    console.log("Juma quote result:", JSON.stringify(destData));

    return new Response(
      JSON.stringify({
        success: true,
        cost: destData.cost,
        distance: destData.distance,
        distanceInfo: destData.distanceInfo,
        duration: destData.duration,
        durationInfo: destData.durationInfo,
        destinationId: destData.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in juma-quote:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
