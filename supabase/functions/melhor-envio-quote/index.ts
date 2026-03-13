// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MELHOR_ENVIO_API = "https://sandbox.melhorenvio.com.br/api/v2";
const STORE_CEP = "75020020";

async function getValidToken(supabase: any): Promise<string> {
  const { data: tokenRow } = await supabase
    .from("melhor_envio_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!tokenRow) {
    throw new Error("Nenhum token do Melhor Envio encontrado.");
  }

  const expiresAt = new Date(tokenRow.expires_at);
  const now = new Date(Date.now() + 5 * 60 * 1000);

  if (expiresAt > now) {
    return tokenRow.access_token;
  }

  // Token expired, try refresh
  const clientId = Deno.env.get("MELHOR_ENVIO_CLIENT_ID");
  const clientSecret = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Credenciais do Melhor Envio não configuradas");
  }

  const refreshResponse = await fetch("https://sandbox.melhorenvio.com.br/oauth/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "GenesisPoint contato@genesispoint.com.br",
    },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokenRow.refresh_token,
    }),
  });

  if (!refreshResponse.ok) {
    const errText = await refreshResponse.text();
    console.error("Token refresh failed:", errText);
    throw new Error("Token expirado e não foi possível renovar.");
  }

  const refreshData = await refreshResponse.json();
  const newExpiresAt = new Date(Date.now() + (refreshData.expires_in || 2592000) * 1000).toISOString();

  await supabase.from("melhor_envio_tokens").update({
    access_token: refreshData.access_token,
    refresh_token: refreshData.refresh_token,
    expires_at: newExpiresAt,
    updated_at: new Date().toISOString(),
  }).eq("id", tokenRow.id);

  return refreshData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let token: string | null = null;
    try {
      token = await getValidToken(supabase);
    } catch (e) {
      console.warn("Could not get token:", e.message);
    }

    const body = await req.json();

    // Action: get-token — return the token for client-side API calls
    if (body.action === "get-token") {
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Nenhum token disponível" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ success: true, token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { destCep, items } = body;

    if (!destCep) {
      return new Response(
        JSON.stringify({ error: "CEP de destino é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalQuantity = (items || []).reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) || 1;
    const weight = Math.max(0.3 * totalQuantity, 0.3);
    const height = Math.min(5 + (totalQuantity - 1) * 2, 50);
    const width = 30;
    const length = 25;
    const totalValue = (items || []).reduce((sum: number, i: any) => sum + (i.price || 50) * (i.quantity || 1), 0) || 50;

    const calcBody = {
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

    // Try authenticated endpoint first, fallback to public if WAF blocks
    let response: Response;
    let usedPublic = false;

    if (token) {
      response = await fetch(`${MELHOR_ENVIO_API}/me/shipment/calculate`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "User-Agent": "GenesisPoint contato@genesispoint.com.br",
        },
        body: JSON.stringify(body),
      });

      // If WAF blocked (403) or unauthenticated (401), try public endpoint
      if (response.status === 403 || response.status === 401) {
        console.warn("Authenticated endpoint blocked, trying public calculator...");
        const bodyText = await response.text(); // consume body
        console.warn("Blocked response:", response.status, bodyText.substring(0, 200));
        usedPublic = true;
      }
    } else {
      usedPublic = true;
    }

    if (usedPublic) {
      // Public calculator endpoint - different payload format
      const publicBody = {
        from: { postal_code: STORE_CEP },
        to: { postal_code: destCep.replace(/\D/g, "") },
        packages: [
          {
            width,
            height,
            length,
            weight,
            insurance_value: totalValue,
          },
        ],
      };

      response = await fetch(`${MELHOR_ENVIO_API}/calculator/calculate`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "GenesisPoint contato@genesispoint.com.br",
        },
        body: JSON.stringify(publicBody),
      });
    }

    if (!response!.ok) {
      const errText = await response!.text();
      console.error("Melhor Envio API error:", response!.status, errText.substring(0, 500));
      throw new Error(`Erro ao calcular frete. Tente novamente.`);
    }

    const data = await response!.json();

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
