// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MELHOR_ENVIO_API = "https://www.melhorenvio.com.br/api/v2";
const STORE_CEP = "75020020";

// Cache em memória do token — evita query no banco em instâncias quentes
let _tokenCache: { token: string; expiresAt: number } | null = null;

async function getValidToken(supabase: any): Promise<string> {
  const bufferMs = 5 * 60 * 1000; // 5 min de margem
  const now = Date.now();

  // Retorna do cache se ainda válido (evita round-trip ao banco)
  if (_tokenCache && _tokenCache.expiresAt > now + bufferMs) {
    return _tokenCache.token;
  }

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
  const expiresAtMs = expiresAt.getTime();

  if (expiresAtMs > now + bufferMs) {
    _tokenCache = { token: tokenRow.access_token, expiresAt: expiresAtMs };
    return tokenRow.access_token;
  }

  // Token expirado — renovar
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
      "User-Agent": "GenesisPoint samuelclodes@gmail.com",
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
  const newExpiresAtMs = now + (refreshData.expires_in || 2592000) * 1000;
  const newExpiresAtIso = new Date(newExpiresAtMs).toISOString();

  await supabase.from("melhor_envio_tokens").update({
    access_token: refreshData.access_token,
    refresh_token: refreshData.refresh_token,
    expires_at: newExpiresAtIso,
    updated_at: new Date().toISOString(),
  }).eq("id", tokenRow.id);

  _tokenCache = { token: refreshData.access_token, expiresAt: newExpiresAtMs };
  return refreshData.access_token;
}

// Cliente Supabase em escopo de módulo — reutilizado entre requests na mesma instância
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    let token: string | null = null;
    try {
      token = await getValidToken(supabase);
    } catch (e) {
      console.warn("Could not get token:", e.message);
    }

    const payload = await req.json();
    const { destCep, items } = payload;

    if (!destCep) {
      return new Response(
        JSON.stringify({ error: "CEP de destino é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalQuantity = (items || []).reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) || 1;
    const totalValue = (items || []).reduce((sum: number, i: any) => sum + (i.price || 50) * (i.quantity || 1), 0) || 50;

    // Try to fetch real product dimensions from DB
    const productIds = (items || [])
      .map((i: any) => i.productId)
      .filter((id: any) => typeof id === "number" && !isNaN(id));

    let weight: number;
    let height: number;
    let width: number;
    let length: number;

    if (productIds.length > 0) {
      const { data: productRows } = await supabase
        .from("products")
        .select("id, weight_g, pkg_height_cm, pkg_width_cm, pkg_length_cm")
        .in("id", productIds);

      const productMap: Record<number, any> = {};
      (productRows || []).forEach((p: any) => { productMap[p.id] = p; });

      let totalWeightG = 0;
      let maxHeight = 0;
      let maxWidth = 0;
      let maxLength = 0;
      let hasRealDimensions = false;

      for (const item of (items || [])) {
        const qty = item.quantity || 1;
        const prod = productMap[item.productId];
        if (prod?.weight_g) {
          totalWeightG += prod.weight_g * qty;
          hasRealDimensions = true;
        }
        if (prod?.pkg_height_cm) maxHeight = Math.max(maxHeight, prod.pkg_height_cm);
        if (prod?.pkg_width_cm) maxWidth = Math.max(maxWidth, prod.pkg_width_cm);
        if (prod?.pkg_length_cm) maxLength = Math.max(maxLength, prod.pkg_length_cm);
      }

      if (hasRealDimensions) {
        weight = Math.max(totalWeightG / 1000, 0.1);
        height = maxHeight > 0 ? Math.min(maxHeight * totalQuantity, 50) : Math.min(5 + (totalQuantity - 1) * 2, 50);
        width = maxWidth > 0 ? maxWidth : 30;
        length = maxLength > 0 ? maxLength : 25;
      } else {
        // Fallback: no dimensions registered yet
        weight = Math.max(0.3 * totalQuantity, 0.3);
        height = Math.min(5 + (totalQuantity - 1) * 2, 50);
        width = 30;
        length = 25;
      }
    } else {
      // No productIds provided — legacy fallback
      weight = Math.max(0.3 * totalQuantity, 0.3);
      height = Math.min(5 + (totalQuantity - 1) * 2, 50);
      width = 30;
      length = 25;
    }

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
          "User-Agent": "GenesisPoint samuelclodes@gmail.com",
        },
        body: JSON.stringify(calcBody),
      });

      // If auth endpoint fails, try public calculator endpoint
      if (!response.ok) {
        const authErrText = await response.text();
        console.warn("Auth endpoint failed:", response.status, authErrText.substring(0, 200));

        if (response.status === 403 && authErrText.includes("E-WAF-0003")) {
          throw new Error("MELHOR_ENVIO_WAF_BLOCKED");
        }

        usedPublic = true;
      }
    } else {
      usedPublic = true;
    }

    if (usedPublic) {
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
          "User-Agent": "GenesisPoint samuelclodes@gmail.com",
        },
        body: JSON.stringify(publicBody),
      });
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("Melhor Envio API error:", response.status, errText.substring(0, 500));

      if (response.status === 403 && errText.includes("E-WAF-0003")) {
        throw new Error("MELHOR_ENVIO_WAF_BLOCKED");
      }

      throw new Error("MELHOR_ENVIO_QUOTE_FAILED");
    }

    const data = await response.json();

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
