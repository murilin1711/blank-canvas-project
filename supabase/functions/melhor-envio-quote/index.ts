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

  if (!tokenRow) throw new Error("Nenhum token do Melhor Envio encontrado.");

  const expiresAtMs = new Date(tokenRow.expires_at).getTime();

  if (expiresAtMs > now + bufferMs) {
    _tokenCache = { token: tokenRow.access_token, expiresAt: expiresAtMs };
    return tokenRow.access_token;
  }

  const clientId = Deno.env.get("MELHOR_ENVIO_CLIENT_ID");
  const clientSecret = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Credenciais do Melhor Envio não configuradas");

  const refreshResponse = await fetch("https://melhorenvio.com.br/oauth/token", {
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

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ============================================================
// SISTEMA DE CÁLCULO DE EMPACOTAMENTO
// ============================================================

// Tamanhos de ziplock (largura × comprimento)
const ZIPLOCK_P = { w: 18, l: 25 };  // acessórios pequenos
const ZIPLOCK_M = { w: 25, l: 35 };  // 1 peça de vestuário ou acessórios grandes
const ZIPLOCK_G = { w: 30, l: 40 };  // 2–3 peças de vestuário

const ACC_H = 6; // altura fixa de todo ziplock de acessório (cm)

// Base útil e altura máxima — envelope somente vestuário / acessórios
const ENV_CLOTHING = [
  { name: "P", baseW: 35, baseL: 45, maxH: 23 },
  { name: "M", baseW: 40, baseL: 60, maxH: 23 },
  { name: "G", baseW: 50, baseL: 75, maxH: 35 },
];

// Base útil e altura máxima — envelope calçados + vestuário
const ENV_MIXED: Record<string, { baseW: number; baseL: number; maxH: number }> = {
  M: { baseW: 42.5, baseL: 52.5, maxH: 35 },
  G: { baseW: 55, baseL: 70, maxH: 35 },
};

interface Block {
  w: number;   // largura (cm)
  l: number;   // comprimento (cm)
  h: number;   // altura (cm)
  rigid: boolean; // true = caixa de sapato; false = ziplock
}

interface Dims { w: number; l: number; h: number; }

// Normaliza string removendo acentos e convertendo para minúsculas
function norm(s: string): string {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Classifica o produto pelo campo 'category' e 'name' do banco
function classifyProduct(category: string, name: string): "calcado" | "vestuario" | "acc_p" | "acc_g" {
  const c = norm(category);
  const n = norm(name);
  if (c.includes("calcad")) return "calcado";
  if (c.includes("vestuari")) return "vestuario";
  if (c.includes("acessori")) {
    // Acessórios grandes: Boina ou Meia Branca Selene Esportiva
    if (n.includes("boina") || (n.includes("meia") && n.includes("selene"))) return "acc_g";
    return "acc_p";
  }
  return "vestuario"; // fallback padrão
}

// Constrói os blocos (caixas de sapato + ziplocks) a partir dos itens do pedido
function buildBlocks(items: any[], productMap: Record<number, any>): {
  blocks: Block[];
  contentType: "only_shoes" | "only_clothing" | "shoes_clothing" | "only_accessories";
  shoeCount: number;
  weightKg: number;
} {
  const shoeBlocks: Block[] = [];
  const clothingH: number[] = []; // altura de cada peça individual
  let smallAcc = 0;
  let largeAcc = 0;
  let weightG = 0;

  for (const item of items) {
    const qty = item.quantity || 1;
    const p = productMap[item.productId];
    if (!p) continue;

    weightG += (p.weight_g || 300) * qty;
    const type = classifyProduct(p.category || "", p.name || "");

    if (type === "calcado") {
      const w = p.pkg_width_cm || 21.5;
      const l = p.pkg_length_cm || 36;
      const h = p.pkg_height_cm || 12.5;
      for (let i = 0; i < qty; i++) shoeBlocks.push({ w, l, h, rigid: true });

    } else if (type === "vestuario") {
      const h = p.pkg_height_cm || 4; // altura individual da peça (cm)
      for (let i = 0; i < qty; i++) clothingH.push(h);

    } else if (type === "acc_p") {
      smallAcc += qty;
    } else { // acc_g
      largeAcc += qty;
    }
  }

  const hasShoes    = shoeBlocks.length > 0;
  const hasClothing = clothingH.length > 0;
  const hasAcc      = smallAcc > 0 || largeAcc > 0;
  const onlyAcc     = !hasShoes && !hasClothing && hasAcc;

  const blocks: Block[] = [...shoeBlocks];

  // Vestuário → ziplocks com fator de compressão
  let rem = [...clothingH];
  while (rem.length > 0) {
    if (rem.length === 1) {
      // 1 peça → ziplock M, sem compressão
      blocks.push({ ...ZIPLOCK_M, h: rem[0], rigid: false });
      rem = [];
    } else {
      // 2–3 peças → ziplock G com fator de compressão
      const grp = rem.splice(0, 3);
      const totalH = grp.reduce((s, h) => s + h, 0);
      const fc = grp.length === 2 ? 0.8 : 0.7;
      blocks.push({ ...ZIPLOCK_G, h: totalH * fc, rigid: false });
    }
  }

  // Acessórios → ziplocks (altura sempre fixa em 6 cm)
  if (hasAcc) {
    if (onlyAcc) {
      if (largeAcc > 0 && smallAcc === 0) {
        // Somente boina/meia → ziplock M
        blocks.push({ ...ZIPLOCK_M, h: ACC_H, rigid: false });
      } else {
        // Somente acessórios (com ou sem grandes)
        const total = smallAcc + largeAcc;
        blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
        if (total >= 10) {
          // Mais de 10 → dois ziplocks P
          blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
        }
      }
    } else {
      // Pedido misto (com vestuário e/ou calçados)
      if (largeAcc > 0) {
        if (smallAcc <= 3) {
          // ≤ 3 pequenos + grandes → tudo em ziplock M
          blocks.push({ ...ZIPLOCK_M, h: ACC_H, rigid: false });
        } else {
          // > 3 pequenos + grandes → ziplock P para pequenos, M para grandes
          blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
          blocks.push({ ...ZIPLOCK_M, h: ACC_H, rigid: false });
        }
      } else if (smallAcc > 0) {
        blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
      }
    }
  }

  let contentType: "only_shoes" | "only_clothing" | "shoes_clothing" | "only_accessories";
  if (hasShoes && !hasClothing)       contentType = "only_shoes";
  else if (!hasShoes && hasClothing)  contentType = "only_clothing";
  else if (hasShoes && hasClothing)   contentType = "shoes_clothing";
  else                                contentType = "only_accessories";

  return { blocks, contentType, shoeCount: shoeBlocks.length, weightKg: Math.max(weightG / 1000, 0.1) };
}

// ---- Estratégias de empacotamento ----

// Estratégia 1: blocos lado a lado (ao longo da largura)
function sideBySide(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  return {
    w: blocks.reduce((s, b) => s + b.w, 0),
    l: Math.max(...blocks.map(b => b.l)),
    h: Math.max(...blocks.map(b => b.h)),
  };
}

// Estratégia 1b: blocos lado a lado (ao longo do comprimento)
function sideBySideL(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  return {
    w: Math.max(...blocks.map(b => b.w)),
    l: blocks.reduce((s, b) => s + b.l, 0),
    h: Math.max(...blocks.map(b => b.h)),
  };
}

// Estratégia 2: blocos empilhados
function stacked(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  return {
    w: Math.max(...blocks.map(b => b.w)),
    l: Math.max(...blocks.map(b => b.l)),
    h: blocks.reduce((s, b) => s + b.h, 0),
  };
}

// Estratégia 3: híbrida — base na frente, menores por cima ou ao lado
function hybridPack(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  if (blocks.length === 1) return { w: blocks[0].w, l: blocks[0].l, h: blocks[0].h };

  const base = blocks[0];
  const rest = blocks.slice(1);

  // Separa os que cabem em cima da base dos que precisam ir ao lado
  const onTop: Block[] = [];
  const beside: Block[] = [];
  for (const b of rest) {
    const fitsNormal  = b.w <= base.w && b.l <= base.l;
    const fitsRotated = b.l <= base.w && b.w <= base.l;
    if (fitsNormal)       onTop.push(b);
    else if (fitsRotated) onTop.push({ ...b, w: b.l, l: b.w }); // rotaciona 90°
    else                  beside.push(b);
  }

  const baseH = base.h + onTop.reduce((s, b) => s + b.h, 0);
  if (!beside.length) return { w: base.w, l: base.l, h: baseH };

  const bAr = sideBySide(beside);
  return {
    w: base.w + bAr.w,
    l: Math.max(base.l, bAr.l),
    h: Math.max(baseH, bAr.h),
  };
}

// Ordena blocos: rígidos primeiro, depois por área decrescente
function sortBlocks(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => {
    if (a.rigid !== b.rigid) return a.rigid ? -1 : 1;
    return (b.w * b.l) - (a.w * a.l);
  });
}

function volume(d: Dims): number { return d.w * d.l * d.h; }

// Encontra as melhores dimensões finais testando todas as estratégias e rotações
function bestDims(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 1, l: 1, h: 1 };

  const sorted = sortBlocks(blocks);

  // Gera variantes com rotações dos blocos não-rígidos (ziplock podem girar 90°)
  const variants: Block[][] = [sorted];
  if (blocks.length <= 6) {
    for (let i = 0; i < sorted.length; i++) {
      if (!sorted[i].rigid) {
        const v = [...sorted];
        v[i] = { ...v[i], w: v[i].l, l: v[i].w };
        variants.push(sortBlocks(v));
      }
    }
  }

  let best: Dims | null = null;
  for (const variant of variants) {
    const strategies: Dims[] = [
      sideBySide(variant),
      sideBySideL(variant),
      stacked(variant),
      hybridPack(variant),
    ];
    for (const d of strategies) {
      if (!best || volume(d) < volume(best)) best = d;
    }
  }

  return best || { w: 30, l: 40, h: 15 };
}

// Calcula as dimensões reais do pacote final (enviadas para o Melhor Envio)
function calcPackageDims(
  blocks: Block[],
  contentType: string,
): Dims {
  if (!blocks.length) return { w: 30, l: 40, h: 15 };

  const d = bestDims(sortBlocks(blocks));

  if (contentType === "only_shoes") {
    // Calçados: dimensões reais + 1 cm de margem de segurança
    return {
      w: Math.max(d.w + 1, 10),
      l: Math.max(d.l + 1, 10),
      h: Math.max(d.h + 1, 1),
    };
  }

  // Vestuário, acessórios ou misto: dimensões reais sem margem adicional
  return {
    w: Math.max(d.w, 10),
    l: Math.max(d.l, 10),
    h: Math.max(d.h, 1),
  };
}

// ============================================================

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

    const totalValue = (items || []).reduce(
      (sum: number, i: any) => sum + (i.price || 50) * (i.quantity || 1), 0
    ) || 50;

    const productIds = (items || [])
      .map((i: any) => i.productId)
      .filter((id: any) => typeof id === "number" && !isNaN(id));

    let width: number;
    let height: number;
    let length: number;
    let weight: number;

    if (productIds.length > 0) {
      const { data: productRows } = await supabase
        .from("products")
        .select("id, name, category, weight_g, pkg_height_cm, pkg_width_cm, pkg_length_cm")
        .in("id", productIds);

      const productMap: Record<number, any> = {};
      (productRows || []).forEach((p: any) => { productMap[p.id] = p; });

      const { blocks, contentType, shoeCount, weightKg } =
        buildBlocks(items || [], productMap);

      const dims = calcPackageDims(blocks, contentType);

      width  = dims.w;
      length = dims.l;
      height = dims.h;
      weight = weightKg;

      console.log("[ME-QUOTE] Packing result:", JSON.stringify({ contentType, shoeCount, blocks, dims: { width, length, height }, weight }, null, 2));
    } else {
      // Fallback: sem IDs de produto
      const totalQty = (items || []).reduce((s: number, i: any) => s + (i.quantity || 1), 0) || 1;
      weight = Math.max(0.3 * totalQty, 0.3);
      height = Math.min(5 + (totalQty - 1) * 2, 50);
      width  = 30;
      length = 40;
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

    console.log("[ME-QUOTE] Payload enviado ao Melhor Envios:", JSON.stringify(calcBody, null, 2));

    // Usa apenas endpoint autenticado — endpoint público retorna preços sem desconto da conta
    if (!token) {
      throw new Error("MELHOR_ENVIO_TOKEN_UNAVAILABLE");
    }

    const response = await fetch(`${MELHOR_ENVIO_API}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "GenesisPoint samuelclodes@gmail.com",
      },
      body: JSON.stringify(calcBody),
    });

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
      .map((s: any) => {
        const fullPrice = Number(s.price);
        const discount = Number(s.discount || 0);
        const finalPrice = Math.max(fullPrice - discount, 0);
        return {
          id: s.id,
          name: s.name,
          company: s.company?.name || "",
          companyLogo: s.company?.picture || "",
          price: finalPrice,
          discount,
          deliveryDays: s.delivery_time,
          deliveryRange: s.delivery_range
            ? { min: s.delivery_range.min, max: s.delivery_range.max }
            : null,
        };
      })
      .filter((s: any) => s.price > 0)
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
