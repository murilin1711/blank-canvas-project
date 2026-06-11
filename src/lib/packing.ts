// Packing recommendation utility — mirrors the algorithm in melhor-envio-quote/index.ts

interface Block { w: number; l: number; h: number; rigid: boolean; }
interface Dims  { w: number; l: number; h: number; }

const ZIPLOCK_M = { w: 25, l: 35 };
const ZIPLOCK_G = { w: 30, l: 40 };
const ZIPLOCK_P = { w: 18, l: 25 };
const ACC_H = 6;

const ENV_CLOTHING = [
  { name: "P", baseW: 35, baseL: 45, maxH: 23 },
  { name: "M", baseW: 40, baseL: 60, maxH: 23 },
  { name: "G", baseW: 50, baseL: 75, maxH: 35 },
];

export interface ProductDim {
  name: string;
  category: string | null;
  pkg_height_cm?: number | null;
  pkg_width_cm?: number | null;
  pkg_length_cm?: number | null;
  weight_g?: number | null;
}

export interface PackageLabel {
  label: string;
  color: string;
  dims: { w: number; l: number; h: number } | null;
}

function norm(s: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function classifyProduct(category: string, name: string) {
  const c = norm(category);
  const n = norm(name);
  if (c.includes("calcad")) return "calcado";
  if (c.includes("acessori")) {
    if (n.includes("boina") || (n.includes("meia") && n.includes("selene"))) return "acc_g";
    return "acc_p";
  }
  return "vestuario";
}

// ---- Packing strategies (same as edge function) ----

function sideBySide(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  return {
    w: blocks.reduce((s, b) => s + b.w, 0),
    l: Math.max(...blocks.map(b => b.l)),
    h: Math.max(...blocks.map(b => b.h)),
  };
}

function sideBySideL(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  return {
    w: Math.max(...blocks.map(b => b.w)),
    l: blocks.reduce((s, b) => s + b.l, 0),
    h: Math.max(...blocks.map(b => b.h)),
  };
}

function stacked(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  return {
    w: Math.max(...blocks.map(b => b.w)),
    l: Math.max(...blocks.map(b => b.l)),
    h: blocks.reduce((s, b) => s + b.h, 0),
  };
}

function hybridPack(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  if (blocks.length === 1) return { w: blocks[0].w, l: blocks[0].l, h: blocks[0].h };

  const base = blocks[0];
  const rest = blocks.slice(1);
  const onTop: Block[] = [];
  const beside: Block[] = [];

  for (const b of rest) {
    if (b.w <= base.w && b.l <= base.l)         onTop.push(b);
    else if (b.l <= base.w && b.w <= base.l)    onTop.push({ ...b, w: b.l, l: b.w });
    else                                          beside.push(b);
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

function sortBlocks(blocks: Block[]): Block[] {
  return [...blocks].sort((a, b) => {
    if (a.rigid !== b.rigid) return a.rigid ? -1 : 1;
    return (b.w * b.l) - (a.w * a.l);
  });
}

function volume(d: Dims) { return d.w * d.l * d.h; }

function bestDims(blocks: Block[]): Dims {
  if (!blocks.length) return { w: 1, l: 1, h: 1 };
  const sorted = sortBlocks(blocks);
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
    for (const d of [sideBySide(variant), sideBySideL(variant), stacked(variant), hybridPack(variant)]) {
      if (!best || volume(d) < volume(best)) best = d;
    }
  }
  return best ?? { w: 30, l: 40, h: 15 };
}

function calcDims(blocks: Block[], contentType: string): Dims {
  if (!blocks.length) return { w: 30, l: 40, h: 15 };
  if (contentType === "only_shoes") {
    // Calçados são rígidos — lado a lado apenas, nunca empilhados
    const sorted = sortBlocks(blocks);
    const sbs  = sideBySide(sorted);
    const sbsl = sideBySideL(sorted);
    const best = volume(sbs) <= volume(sbsl) ? sbs : sbsl;
    return { w: Math.max(best.w + 1, 10), l: Math.max(best.l + 1, 10), h: Math.max(best.h + 1, 1) };
  }
  const d = bestDims(sortBlocks(blocks));
  return { w: Math.max(d.w, 10), l: Math.max(d.l, 10), h: Math.max(d.h, 1) };
}

// ---- Build blocks from order items ----

function buildBlocks(
  items: Array<{ productName: string; quantity: number }>,
  byName: Record<string, ProductDim>
): { blocks: Block[]; contentType: string; shoeCount: number } {
  const shoeBlocks: Block[] = [];
  const clothingH: number[] = [];
  let accSmall = 0;
  let accLarge = 0;

  for (const { productName, quantity } of items) {
    const p = byName[productName];
    if (!p) continue;
    const type = classifyProduct(p.category || "", productName);

    if (type === "calcado") {
      const w = p.pkg_width_cm  || 21.5;
      const l = p.pkg_length_cm || 36;
      const h = p.pkg_height_cm || 12.5;
      for (let i = 0; i < quantity; i++) shoeBlocks.push({ w, l, h, rigid: true });
    } else if (type === "vestuario") {
      const h = p.pkg_height_cm || 4;
      for (let i = 0; i < quantity; i++) clothingH.push(h);
    } else if (type === "acc_p") {
      accSmall += quantity;
    } else {
      accLarge += quantity;
    }
  }

  const hasShoes    = shoeBlocks.length > 0;
  const hasClothing = clothingH.length > 0;
  const hasAcc      = accSmall > 0 || accLarge > 0;
  const onlyAcc     = !hasShoes && !hasClothing && hasAcc;

  const blocks: Block[] = [...shoeBlocks];

  // Clothing → ziplocks with compression factor
  let rem = [...clothingH];
  while (rem.length > 0) {
    if (rem.length === 1) {
      blocks.push({ ...ZIPLOCK_M, h: rem.shift()!, rigid: false });
    } else {
      const grp = rem.splice(0, 3);
      const fc = grp.length === 2 ? 0.8 : 0.7;
      blocks.push({ ...ZIPLOCK_G, h: grp.reduce((s, h) => s + h, 0) * fc, rigid: false });
    }
  }

  // Accessories → ziplocks (fixed 6cm height)
  if (hasAcc) {
    if (onlyAcc) {
      if (accLarge > 0 && accSmall === 0) {
        blocks.push({ ...ZIPLOCK_M, h: ACC_H, rigid: false });
      } else {
        blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
        if (accSmall + accLarge > 10) blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
      }
    } else {
      if (accLarge > 0) {
        if (accSmall <= 3) blocks.push({ ...ZIPLOCK_M, h: ACC_H, rigid: false });
        else { blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false }); blocks.push({ ...ZIPLOCK_M, h: ACC_H, rigid: false }); }
      } else if (accSmall > 0) {
        blocks.push({ ...ZIPLOCK_P, h: ACC_H, rigid: false });
      }
    }
  }

  let contentType: string;
  if (hasShoes && !hasClothing && !hasAcc) contentType = "only_shoes";
  else if (!hasShoes && hasClothing)       contentType = "only_clothing";
  else if (hasShoes && (hasClothing || hasAcc)) contentType = "shoes_clothing";
  else                                     contentType = "only_accessories";

  return { blocks, contentType, shoeCount: shoeBlocks.length };
}

// ---- Envelope label ----

function envelopeLabel(dims: Dims, contentType: string, shoeCount: number): string {
  if (contentType === "only_shoes") {
    if (shoeCount <= 1) return "Envelope P";
    if (shoeCount === 2) return "Envelope M";
    return "Envelope G";
  }
  if (contentType === "only_clothing" || contentType === "only_accessories") {
    for (const env of ENV_CLOTHING) {
      if (dims.w <= env.baseW && dims.l <= env.baseL && dims.h <= env.maxH) return `Envelope ${env.name}`;
    }
    return "Envelope G";
  }
  // shoes_clothing
  return shoeCount === 1 ? "Envelope M" : "Envelope G";
}

// ---- Public API ----

export function getPackageLabel(
  items: Array<{ productName: string; quantity: number }>,
  products: ProductDim[]
): PackageLabel {
  if (!items.length || !products.length) return { label: "—", color: "bg-gray-100 text-gray-500", dims: null };

  const byName: Record<string, ProductDim> = {};
  products.forEach(p => { byName[p.name] = p; });

  const { blocks, contentType, shoeCount } = buildBlocks(items, byName);

  if (!blocks.length) return { label: "—", color: "bg-gray-100 text-gray-500", dims: null };

  // Overflow: sapatos + roupa com mais de 2 sapatos → 2 pacotes
  if (contentType === "shoes_clothing" && shoeCount > 2) {
    const rigidBlocks   = blocks.filter(b => b.rigid);
    const softBlocks    = blocks.filter(b => !b.rigid);
    const mainBlocks    = [...rigidBlocks.slice(0, 2), ...softBlocks];
    const overflowBlocks = rigidBlocks.slice(2);

    const mainDims = calcDims(mainBlocks, "shoes_clothing");
    const overflowCount = overflowBlocks.length;
    const overflowEnv = overflowCount === 1 ? "Envelope P" : overflowCount === 2 ? "Envelope M" : "Envelope G";

    const rounded = { w: Math.ceil(mainDims.w), l: Math.ceil(mainDims.l), h: Math.ceil(mainDims.h) };
    return { label: `Envelope G + ${overflowEnv}`, color: "bg-red-100 text-red-700", dims: rounded };
  }

  const dims = calcDims(blocks, contentType);
  const label = envelopeLabel(dims, contentType, shoeCount);

  const rounded = {
    w: Math.ceil(dims.w),
    l: Math.ceil(dims.l),
    h: Math.ceil(dims.h),
  };

  const color =
    label.includes("G") ? "bg-orange-100 text-orange-700" :
    label.includes("M") ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700";

  return { label, color, dims: rounded };
}
