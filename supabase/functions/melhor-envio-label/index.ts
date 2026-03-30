// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ME_API = "https://www.melhorenvio.com.br/api/v2";
const ME_USER_AGENT = "GM Minas samuelclodes@gmail.com";
const STORE_CEP = "75020020";

// ── Token helper (reutilizado do melhor-envio-quote) ──────────────────────────
let _tokenCache: { token: string; expiresAt: number } | null = null;

async function getValidToken(supabase: any): Promise<string> {
  const bufferMs = 5 * 60 * 1000;
  const now = Date.now();

  if (_tokenCache && _tokenCache.expiresAt > now + bufferMs) {
    return _tokenCache.token;
  }

  const { data: tokenRow } = await supabase
    .from("melhor_envio_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!tokenRow) throw new Error("Token do Melhor Envio não encontrado. Autorize primeiro.");

  const expiresAtMs = new Date(tokenRow.expires_at).getTime();
  if (expiresAtMs > now + bufferMs) {
    _tokenCache = { token: tokenRow.access_token, expiresAt: expiresAtMs };
    return tokenRow.access_token;
  }

  // Renovar token
  const clientId = Deno.env.get("MELHOR_ENVIO_CLIENT_ID");
  const clientSecret = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Credenciais do Melhor Envio não configuradas");

  const refreshRes = await fetch("https://melhorenvio.com.br/oauth/token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": ME_USER_AGENT },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokenRow.refresh_token,
    }),
  });

  if (!refreshRes.ok) throw new Error("Não foi possível renovar o token do Melhor Envio.");
  const refreshData = await refreshRes.json();
  const newExpiresAtMs = now + (refreshData.expires_in || 2592000) * 1000;

  await supabase.from("melhor_envio_tokens").update({
    access_token: refreshData.access_token,
    refresh_token: refreshData.refresh_token,
    expires_at: new Date(newExpiresAtMs).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", tokenRow.id);

  _tokenCache = { token: refreshData.access_token, expiresAt: newExpiresAtMs };
  return refreshData.access_token;
}

// ── Admin token validation ────────────────────────────────────────────────────
function validateAdminToken(token: string): boolean {
  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    const prefix = parts[0];
    const expiresAt = parseInt(parts[1]);
    return (prefix === "admin" || prefix === "caixa") && Date.now() < expiresAt;
  } catch {
    return false;
  }
}

// ── Helper: ME authenticated fetch ───────────────────────────────────────────
async function meFetch(path: string, meToken: string, options: RequestInit = {}) {
  const res = await fetch(`${ME_API}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${meToken}`,
      "User-Agent": ME_USER_AGENT,
      ...(options.headers || {}),
    },
  });
  return res;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { action, token, orderId, serviceId } = await req.json();

    if (!validateAdminToken(token)) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const meToken = await getValidToken(supabase);

    // ── ACTION: quote ─────────────────────────────────────────────────────────
    // Busca cotações disponíveis para o CEP do pedido (para o admin escolher o serviço)
    if (action === "quote") {
      if (!orderId) throw new Error("orderId é obrigatório");

      const { data: order } = await supabase
        .from("orders")
        .select("shipping_address, order_items(*)")
        .eq("id", orderId)
        .single();

      if (!order) throw new Error("Pedido não encontrado");

      const addr = order.shipping_address || {};
      const destCep = (addr.cep || "").replace(/\D/g, "");
      if (!destCep) throw new Error("CEP de destino não encontrado no pedido");

      const totalQty = (order.order_items || []).reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 1;
      const totalValue = (order.order_items || []).reduce((s: number, i: any) => s + (i.price || 50) * (i.quantity || 1), 0) || 50;

      const calcBody = {
        from: { postal_code: STORE_CEP },
        to: { postal_code: destCep },
        products: [{ id: "uniforms", width: 30, height: Math.min(5 * totalQty, 50), length: 25, weight: Math.max(0.3 * totalQty, 0.3), insurance_value: totalValue, quantity: 1 }],
      };

      const res = await meFetch("/me/shipment/calculate", meToken, { method: "POST", body: JSON.stringify(calcBody) });
      if (!res.ok) throw new Error("Erro ao cotar frete: " + await res.text());
      const data = await res.json();

      const options = data
        .filter((s: any) => !s.error && s.price && Number(s.price) > 0)
        .map((s: any) => ({
          id: s.id,
          name: s.name,
          company: s.company?.name || "",
          companyLogo: s.company?.picture || "",
          price: Number(s.price),
          deliveryDays: s.delivery_time,
        }))
        .sort((a: any, b: any) => a.price - b.price);

      return new Response(JSON.stringify({ success: true, options }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: generate ──────────────────────────────────────────────────────
    // Fluxo completo: carrinho → checkout → gerar → imprimir
    if (action === "generate") {
      if (!orderId) throw new Error("orderId é obrigatório");
      if (!serviceId) throw new Error("serviceId é obrigatório");

      // 1. Buscar pedido + itens + perfil do cliente
      const { data: order } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();

      if (!order) throw new Error("Pedido não encontrado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, email, phone, cpf")
        .eq("user_id", order.user_id)
        .single();

      const addr = order.shipping_address || {};
      const destCep = (addr.cep || "").replace(/\D/g, "");
      if (!destCep) throw new Error("CEP de destino não encontrado no pedido");

      // 2. Buscar perfil do remetente (loja) no Melhor Envio
      const meProfileRes = await meFetch("/me", meToken, { method: "GET" });
      if (!meProfileRes.ok) throw new Error("Erro ao buscar perfil do Melhor Envio");
      const meProfile = await meProfileRes.json();

      const senderAddress = (meProfile.addresses || [])[0] || {};

      // 3. Montar corpo do carrinho
      const totalQty = (order.order_items || []).reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 1;
      const totalValue = (order.order_items || []).reduce((s: number, i: any) => s + (i.price || 50) * (i.quantity || 1), 0) || 50;

      const cartBody = {
        service: serviceId,
        agency: null,
        from: {
          name: meProfile.firstname ? `${meProfile.firstname} ${meProfile.lastname || ""}`.trim() : "GM Minas",
          phone: meProfile.phone || "62999999999",
          email: meProfile.email || "samuelclodes@gmail.com",
          document: meProfile.document || meProfile.company_document || "00000000000",
          address: senderAddress.address || "Rua não cadastrada",
          complement: senderAddress.complement || "",
          number: senderAddress.number || "S/N",
          district: senderAddress.district || "Centro",
          city: senderAddress.city || "Anápolis",
          country_id: "BR",
          postal_code: STORE_CEP,
          note: "",
        },
        to: {
          name: profile?.name || "Cliente",
          phone: (profile?.phone || "").replace(/\D/g, "") || "62999999999",
          email: profile?.email || "cliente@email.com",
          document: (profile?.cpf || "").replace(/\D/g, "") || "00000000000",
          address: addr.street || addr.rua || "Rua não informada",
          complement: addr.complement || addr.complemento || "",
          number: addr.number || addr.numero || "S/N",
          district: addr.neighborhood || addr.bairro || "Centro",
          city: addr.city || addr.cidade || "",
          country_id: "BR",
          postal_code: destCep,
          note: `Pedido #${orderId.slice(0, 8)}`,
        },
        products: (order.order_items || []).map((item: any) => ({
          name: item.product_name || "Uniforme",
          quantity: item.quantity || 1,
          unitaryValue: item.price || 50,
        })),
        volumes: {
          height: Math.min(5 * totalQty, 50),
          width: 30,
          length: 25,
          weight: Math.max(0.3 * totalQty, 0.3),
        },
        options: {
          insurance_value: totalValue,
          receipt: false,
          own_hand: false,
          reverse: false,
          non_commercial: false,
          tags: [{ tag: `pedido-${orderId.slice(0, 8)}`, url: null }],
        },
      };

      // 4. Adicionar ao carrinho Melhor Envio
      const cartRes = await meFetch("/me/cart", meToken, { method: "POST", body: JSON.stringify(cartBody) });
      if (!cartRes.ok) {
        const errText = await cartRes.text();
        throw new Error(`Erro ao adicionar ao carrinho ME: ${errText}`);
      }
      const cartData = await cartRes.json();
      const meOrderId = cartData.id;
      if (!meOrderId) throw new Error("Melhor Envio não retornou ID do envio");

      // 5. Checkout (debitar do saldo)
      const checkoutRes = await meFetch("/me/shipment/checkout", meToken, {
        method: "POST",
        body: JSON.stringify({ orders: [meOrderId] }),
      });
      if (!checkoutRes.ok) {
        const errText = await checkoutRes.text();
        throw new Error(`Erro no checkout ME (verifique saldo): ${errText}`);
      }

      // 6. Gerar etiqueta
      const generateRes = await meFetch("/me/shipment/generate", meToken, {
        method: "POST",
        body: JSON.stringify({ orders: [meOrderId] }),
      });
      if (!generateRes.ok) {
        const errText = await generateRes.text();
        throw new Error(`Erro ao gerar etiqueta ME: ${errText}`);
      }
      const generateData = await generateRes.json();
      const trackingCode = generateData?.[meOrderId]?.tracking || generateData?.tracking || null;

      // 7. Obter link de impressão (PDF público)
      const printRes = await meFetch(
        `/me/shipment/print?orders[]=${meOrderId}&mode=public`,
        meToken,
        { method: "GET" },
      );
      let labelUrl: string | null = null;
      if (printRes.ok) {
        // Pode ser redirect (302) ou JSON com URL
        if (printRes.redirected) {
          labelUrl = printRes.url;
        } else {
          const contentType = printRes.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const printData = await printRes.json();
            labelUrl = printData?.url || printData?.link || null;
          } else {
            // É o PDF direto — construir URL de impressão autenticada para o admin usar
            labelUrl = `${ME_API}/me/shipment/print?orders[]=${meOrderId}&mode=public`;
          }
        }
      }

      // 8. Salvar dados no pedido (dentro do shipping_address para não precisar de migração)
      const updatedAddress = {
        ...(order.shipping_address || {}),
        label_url: labelUrl,
        tracking_code: trackingCode,
        me_order_id: meOrderId,
        label_generated_at: new Date().toISOString(),
      };

      await supabase
        .from("orders")
        .update({ shipping_address: updatedAddress, status: "separating" })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({ success: true, labelUrl, trackingCode, meOrderId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Ação inválida. Use: quote ou generate" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("melhor-envio-label error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
