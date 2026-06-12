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

// ============================================================
// SISTEMA DE CÁLCULO DE EMPACOTAMENTO (espelho do melhor-envio-quote)
// ============================================================

const ZIPLOCK_P = { w: 18, l: 25 };
const ZIPLOCK_M = { w: 25, l: 35 };
const ZIPLOCK_G = { w: 30, l: 40 };
const ACC_H = 6;

interface Block { w: number; l: number; h: number; rigid: boolean; }
interface Dims  { w: number; l: number; h: number; }

function norm(s: string): string {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function classifyProduct(category: string, name: string): "calcado" | "vestuario" | "acc_p" | "acc_g" {
  const c = norm(category);
  const n = norm(name);
  if (c.includes("calcad")) return "calcado";
  if (c.includes("vestuari")) return "vestuario";
  if (c.includes("acessori")) {
    if (n.includes("boina") || (n.includes("meia") && n.includes("selene"))) return "acc_g";
    return "acc_p";
  }
  return "vestuario";
}

function buildBlocks(items: any[], productMap: Record<number, any>): {
  blocks: Block[]; weightKg: number; contentType: string;
} {
  const shoeBlocks: Block[] = [];
  const clothingH: number[] = [];
  let smallAcc = 0; let largeAcc = 0; let weightG = 0;

  for (const item of items) {
    const qty = item.quantity || 1;
    const p = productMap[item.product_id ?? item.productId];
    if (!p) continue;
    weightG += (p.weight_g || 300) * qty;
    const type = classifyProduct(p.category || "", p.name || "");
    if (type === "calcado") {
      const w = p.pkg_width_cm || 21.5;
      const l = p.pkg_length_cm || 36;
      const h = p.pkg_height_cm || 12.5;
      for (let i = 0; i < qty; i++) shoeBlocks.push({ w, l, h, rigid: true });
    } else if (type === "vestuario") {
      const h = p.pkg_height_cm || 4;
      for (let i = 0; i < qty; i++) clothingH.push(h);
    } else if (type === "acc_p") {
      smallAcc += qty;
    } else {
      largeAcc += qty;
    }
  }

  const hasShoes    = shoeBlocks.length > 0;
  const hasClothing = clothingH.length > 0;
  const hasAcc      = smallAcc > 0 || largeAcc > 0;
  const onlyAcc     = !hasShoes && !hasClothing && hasAcc;

  const blocks: Block[] = [...shoeBlocks];

  let rem = [...clothingH];
  while (rem.length > 0) {
    if (rem.length === 1) {
      blocks.push({ ...ZIPLOCK_M, h: rem[0], rigid: false }); rem = [];
    } else {
      const grp = rem.splice(0, 3);
      const fc = grp.length === 2 ? 0.8 : 0.7;
      blocks.push({ ...ZIPLOCK_G, h: grp.reduce((s, h) => s + h, 0) * fc, rigid: false });
    }
  }

  if (hasAcc) {
    if (onlyAcc) {
      if (largeAcc > 0 && smallAcc === 0) {
        blocks.push({ ...ZIPLOCK_M, h: ACC_H, rigid: false });
      } else {
        blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
        if (smallAcc + largeAcc >= 10) blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
      }
    } else {
      if (largeAcc > 0) {
        if (smallAcc <= 3) blocks.push({ ...ZIPLOCK_M, h: ACC_H, rigid: false });
        else { blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false }); blocks.push({ ...ZIPLOCK_M, h: ACC_H, rigid: false }); }
      } else if (smallAcc > 0) {
        blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
      }
    }
  }

  let contentType: string;
  if (hasShoes && !hasClothing)      contentType = "only_shoes";
  else if (!hasShoes && hasClothing) contentType = "only_clothing";
  else if (hasShoes && hasClothing)  contentType = "shoes_clothing";
  else                               contentType = "only_accessories";

  return { blocks, weightKg: Math.max(weightG / 1000, 0.1), contentType };
}

function sideBySide(b: Block[]): Dims { return { w: b.reduce((s,x)=>s+x.w,0), l: Math.max(...b.map(x=>x.l)), h: Math.max(...b.map(x=>x.h)) }; }
function sideBySideL(b: Block[]): Dims { return { w: Math.max(...b.map(x=>x.w)), l: b.reduce((s,x)=>s+x.l,0), h: Math.max(...b.map(x=>x.h)) }; }
function stacked(b: Block[]): Dims { return { w: Math.max(...b.map(x=>x.w)), l: Math.max(...b.map(x=>x.l)), h: b.reduce((s,x)=>s+x.h,0) }; }
function volume(d: Dims): number { return d.w * d.l * d.h; }

function hybridPack(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  if (blocks.length === 1) return { w: blocks[0].w, l: blocks[0].l, h: blocks[0].h };
  const base = blocks[0]; const rest = blocks.slice(1);
  const onTop: Block[] = []; const beside: Block[] = [];
  for (const b of rest) {
    if (b.w <= base.w && b.l <= base.l) onTop.push(b);
    else if (b.l <= base.w && b.w <= base.l) onTop.push({ ...b, w: b.l, l: b.w });
    else beside.push(b);
  }
  const baseH = base.h + onTop.reduce((s,b)=>s+b.h,0);
  if (!beside.length) return { w: base.w, l: base.l, h: baseH };
  const bAr = sideBySide(beside);
  return { w: base.w + bAr.w, l: Math.max(base.l, bAr.l), h: Math.max(baseH, bAr.h) };
}

function sortBlocks(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => a.rigid !== b.rigid ? (a.rigid ? -1 : 1) : (b.w*b.l)-(a.w*a.l));
}

function bestDims(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 1, l: 1, h: 1 };
  const sorted = sortBlocks(blocks);
  const variants: Block[][] = [sorted];
  if (blocks.length <= 6) {
    for (let i = 0; i < sorted.length; i++) {
      if (!sorted[i].rigid) {
        const v = [...sorted]; v[i] = { ...v[i], w: v[i].l, l: v[i].w };
        variants.push(sortBlocks(v));
      }
    }
  }
  let best: Dims | null = null;
  for (const variant of variants) {
    for (const d of [sideBySide(variant), sideBySideL(variant), stacked(variant), hybridPack(variant)]) {
      if (!best || volume(d) < volume(best)) best = d;
    }
  }
  return best || { w: 30, l: 40, h: 15 };
}

function calcPackageDims(blocks: Block[], contentType: string): Dims {
  if (!blocks.length) return { w: 30, l: 40, h: 15 };
  const d = bestDims(sortBlocks(blocks));
  if (contentType === "only_shoes") {
    return { w: Math.max(d.w+1,10), l: Math.max(d.l+1,10), h: Math.max(d.h+1,1) };
  }
  return { w: Math.max(d.w,10), l: Math.max(d.l,10), h: Math.max(d.h,1) };
}

// Busca produtos do banco e calcula dimensões do pacote (usado em quote e generate)
async function calcDimsFromOrder(
  orderItems: any[],
  supabase: any,
): Promise<{ dims: Dims; weightKg: number; contentType: string }> {
  const productIds = orderItems
    .map((i: any) => i.product_id ?? i.productId)
    .filter((id: any) => id != null);

  if (productIds.length === 0) {
    const totalQty = orderItems.reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 1;
    return {
      dims: { w: 30, l: 25, h: Math.min(5 * totalQty, 50) },
      weightKg: Math.max(0.3 * totalQty, 0.3),
      contentType: "only_clothing",
    };
  }

  const { data: productRows } = await supabase
    .from("products")
    .select("id, name, category, weight_g, pkg_height_cm, pkg_width_cm, pkg_length_cm")
    .in("id", productIds);

  const productMap: Record<number, any> = {};
  (productRows || []).forEach((p: any) => { productMap[p.id] = p; });

  const { blocks, weightKg, contentType } = buildBlocks(orderItems, productMap);
  const dims = calcPackageDims(blocks, contentType);
  return { dims, weightKg, contentType };
}

// ============================================================

function isValidCPF(cpf: string): boolean {
  const stripped = (cpf || "").replace(/\D/g, "");
  if (stripped.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(stripped)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(stripped[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(stripped[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(stripped[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(stripped[10])) return false;
  return true;
}

function isValidCNPJ(cnpj: string): boolean {
  const stripped = (cnpj || "").replace(/\D/g, "");
  if (stripped.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(stripped)) return false;
  
  let size = stripped.length - 2;
  let numbers = stripped.substring(0, size);
  const digits = stripped.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = stripped.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

function getValidDocument(doc: string, preferCpf = false): string {
  const clean = (doc || "").replace(/\D/g, "");
  if (isValidCPF(clean) || isValidCNPJ(clean)) {
    return clean;
  }
  // CPF válido de fallback (aceito pela ME quando CNPJ não está disponível)
  if (preferCpf || clean.length <= 11) return "00000000191";
  return "00000000191";
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

      const totalValue = (order.order_items || []).reduce((s: number, i: any) => s + (i.price || 50) * (i.quantity || 1), 0) || 50;

      const { dims, weightKg } = await calcDimsFromOrder(order.order_items || [], supabase);

      const calcBody = {
        from: { postal_code: STORE_CEP },
        to: { postal_code: destCep },
        products: [{ id: "uniforms", width: dims.w, height: dims.h, length: dims.l, weight: weightKg, insurance_value: totalValue, quantity: 1 }],
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

      // 2. Buscar perfil do remetente (loja) no Melhor Envio (com fallback)
      let meProfile: any = {};
      let senderAddress: any = {};
      try {
        const meProfileRes = await meFetch("/me", meToken, { method: "GET" });
        if (meProfileRes.ok) {
          meProfile = await meProfileRes.json();
          senderAddress = (meProfile.addresses || [])[0] || {};
        }
      } catch {
        // usa fallback abaixo
      }

      // 3. Montar corpo do carrinho
      const totalValue = (order.order_items || []).reduce((s: number, i: any) => s + (i.price || 50) * (i.quantity || 1), 0) || 50;

      // Usar o mesmo algoritmo de empacotamento que o melhor-envio-quote
      const { dims: packDims, weightKg } = await calcDimsFromOrder(order.order_items || [], supabase);

      console.log("[ME-LABEL] Packing dims:", JSON.stringify({ ...packDims, weightKg }));

      const cartBody = {
        service: serviceId,
        agency: null,
        from: {
          name: meProfile.firstname ? `${meProfile.firstname} ${meProfile.lastname || ""}`.trim() : "GM Minas",
          phone: meProfile.phone || "62999999999",
          email: meProfile.email || "samuelclodes@gmail.com",
          document: getValidDocument(meProfile.document || meProfile.company_document),
          address: senderAddress.address || "Rua Guimaraes Natal",
          complement: senderAddress.complement || "",
          number: senderAddress.number || "50",
          district: senderAddress.district || "Setor Central",
          city: senderAddress.city || "Anapolis",
          country_id: "BR",
          postal_code: STORE_CEP,
          note: "",
        },
        to: {
          name: profile?.name || "Cliente",
          phone: (profile?.phone || "").replace(/\D/g, "") || "62999999999",
          email: profile?.email || "cliente@email.com",
          document: getValidDocument(addr.cpf || profile?.cpf, true),
          address: addr.street || addr.rua || "Rua não informada",
          complement: addr.complement || addr.complemento || "",
          number: addr.number || addr.numero || "S/N",
          district: addr.neighborhood || addr.bairro || "Centro",
          city: addr.city || addr.cidade || "",
          country_id: "BR",
          postal_code: destCep,
          note: `Pedido #${orderId.slice(0, 8)}`,
        },
        products: (order.order_items || []).length > 0
          ? (order.order_items || []).map((item: any) => ({
              name: item.product_name || "Uniforme",
              quantity: item.quantity || 1,
              unitary_value: item.price || 50,
            }))
          : [
              {
                name: "Uniforme",
                quantity: 1,
                unitaryValue: totalValue,
              }
            ],
        volumes: {
          height: packDims.h,
          width: packDims.w,
          length: packDims.l,
          weight: weightKg,
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
          // Sempre tenta parsear como JSON independente do content-type
          // pois o ME às vezes retorna application/json com content-type errado
          try {
            const printData = await printRes.json();
            labelUrl = printData?.url || printData?.link || null;
          } catch {
            // Se não for JSON, tenta extrair URL do texto
            try {
              const text = await printRes.text();
              const match = text.match(/https?:\/\/[^\s"'<>]+/);
              if (match) labelUrl = match[0];
            } catch {
              // não foi possível extrair URL
            }
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

    // ── ACTION: reprint ───────────────────────────────────────────────────────
    // Recupera (ou regenera) a URL de impressão de um pedido já gerado
    if (action === "reprint") {
      if (!orderId) throw new Error("orderId é obrigatório");

      const { data: order } = await supabase
        .from("orders")
        .select("shipping_address")
        .eq("id", orderId)
        .single();

      if (!order) throw new Error("Pedido não encontrado");

      const meOrderId = order.shipping_address?.me_order_id;
      if (!meOrderId) throw new Error("Etiqueta ainda não foi gerada para este pedido");

      const printRes = await meFetch(
        `/me/shipment/print?orders[]=${meOrderId}&mode=public`,
        meToken,
        { method: "GET" },
      );

      let labelUrl: string | null = null;
      if (printRes.ok) {
        if (printRes.redirected) {
          labelUrl = printRes.url;
        } else {
          try {
            const printData = await printRes.json();
            labelUrl = printData?.url || printData?.link || null;
          } catch {
            try {
              const text = await printRes.text();
              const match = text.match(/https?:\/\/[^\s"'<>]+/);
              if (match) labelUrl = match[0];
            } catch {
              // não foi possível extrair URL
            }
          }
        }
      }

      if (!labelUrl) throw new Error("Não foi possível obter a URL de impressão. Verifique se a etiqueta ainda está disponível no Melhor Envio.");

      // Atualizar label_url salva no pedido
      await supabase
        .from("orders")
        .update({
          shipping_address: { ...order.shipping_address, label_url: labelUrl },
        })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({ success: true, labelUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Ação inválida. Use: quote, generate ou reprint" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("melhor-envio-label error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
