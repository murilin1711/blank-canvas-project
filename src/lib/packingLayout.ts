// Extension of the packing algorithm that tracks block positions for visual illustration.

import { type ProductDim } from "@/lib/packing";

const ZIPLOCK_M_DIMS = { w: 25, l: 35 };
const ZIPLOCK_G_DIMS = { w: 30, l: 40 };
const ZIPLOCK_P_DIMS = { w: 18, l: 25 };
const ACC_H = 6;

const ENV_CLOTHING = [
  { name: "P", baseW: 35, baseL: 45, maxH: 23 },
  { name: "M", baseW: 40, baseL: 60, maxH: 23 },
  { name: "G", baseW: 50, baseL: 75, maxH: 35 },
];

// ── Types ──────────────────────────────────────────────────────────────────────

export type BlockKind = "ziplock_p" | "ziplock_m" | "ziplock_g" | "shoe_box";

// SVG file key for shoe boxes (identifies the exact caixa illustration)
export type ShoeSvgKey = "oly" | "rdl" | "cp" | "bw" | "lyd" | "md" | "sd";

export interface LabeledBlock {
  w: number;
  l: number;
  h: number;
  rigid: boolean;
  kind: BlockKind;
  label: string; // may contain \n for two lines
  svgKey?: ShoeSvgKey; // set for shoe_box blocks
}

export interface PlacedBlock extends LabeledBlock {
  x: number; // cm from left
  y: number; // cm from top
  z: number; // cm from bottom (0 = ground level)
}

export interface PackingLayout {
  envelopeLabel: string;
  envelopeColor: string;
  dims: { w: number; l: number; h: number };
  weightKg: number;
  blocks: PlacedBlock[];
  contentType: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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

function trunc(s: string, len: number) {
  return s.length > len ? s.slice(0, len - 1) + "…" : s;
}

function shoeSvgKey(name: string): ShoeSvgKey {
  const n = norm(name);
  if (n.includes("olympikus") || n.includes("olimpikus")) return "oly";
  if (n.includes("randall")) return "rdl";
  if (n.includes("cal prado") || n.includes("calprado")) return "cp";
  if (n.includes("bootswear") || n.includes("boots")) return "bw";
  if (n.includes("lindy")) return "lyd";
  if (n.includes("modari")) return "md";
  if (n.includes("saad")) return "sd";
  return "oly"; // fallback
}

function dimsOf(blocks: PlacedBlock[]) {
  if (!blocks.length) return { w: 0, l: 0, h: 0 };
  return {
    w: Math.max(...blocks.map(b => b.x + b.w)),
    l: Math.max(...blocks.map(b => b.y + b.l)),
    h: Math.max(...blocks.map(b => b.z + b.h)),
  };
}

function vol(d: { w: number; l: number; h: number }) {
  return d.w * d.l * d.h;
}

function sortLabeled(blocks: LabeledBlock[]): LabeledBlock[] {
  return [...blocks].sort((a, b) => {
    if (a.rigid !== b.rigid) return a.rigid ? -1 : 1;
    return b.w * b.l - a.w * a.l;
  });
}

// ── Positioned packing strategies ─────────────────────────────────────────────

function placedSideBySide(blocks: LabeledBlock[]): PlacedBlock[] {
  let x = 0;
  return blocks.map(b => {
    const pb: PlacedBlock = { ...b, x, y: 0, z: 0 };
    x += b.w;
    return pb;
  });
}

function placedSideBySideL(blocks: LabeledBlock[]): PlacedBlock[] {
  let y = 0;
  return blocks.map(b => {
    const pb: PlacedBlock = { ...b, x: 0, y, z: 0 };
    y += b.l;
    return pb;
  });
}

function placedStacked(blocks: LabeledBlock[]): PlacedBlock[] {
  let z = 0;
  return blocks.map(b => {
    const pb: PlacedBlock = { ...b, x: 0, y: 0, z };
    z += b.h;
    return pb;
  });
}

function placedHybrid(blocks: LabeledBlock[]): PlacedBlock[] {
  if (!blocks.length) return [];
  if (blocks.length === 1) return [{ ...blocks[0], x: 0, y: 0, z: 0 }];

  const base = blocks[0];
  const rest = blocks.slice(1);
  const onTop: LabeledBlock[] = [];
  const beside: LabeledBlock[] = [];

  for (const b of rest) {
    if (b.w <= base.w && b.l <= base.l) {
      onTop.push(b);
    } else if (b.l <= base.w && b.w <= base.l) {
      onTop.push({ ...b, w: b.l, l: b.w });
    } else {
      beside.push(b);
    }
  }

  const placed: PlacedBlock[] = [{ ...base, x: 0, y: 0, z: 0 }];
  let z = base.h;
  for (const b of onTop) {
    placed.push({ ...b, x: 0, y: 0, z });
    z += b.h;
  }
  let bx = base.w;
  for (const b of beside) {
    placed.push({ ...b, x: bx, y: 0, z: 0 });
    bx += b.w;
  }
  return placed;
}

function bestPlacedLayout(blocks: LabeledBlock[]): PlacedBlock[] {
  if (!blocks.length) return [];
  const sorted = sortLabeled(blocks);

  const variants: LabeledBlock[][] = [sorted];
  if (blocks.length <= 6) {
    for (let i = 0; i < sorted.length; i++) {
      if (!sorted[i].rigid) {
        const v = [...sorted];
        v[i] = { ...v[i], w: v[i].l, l: v[i].w };
        variants.push(sortLabeled(v));
      }
    }
  }

  let bestPlaced: PlacedBlock[] | null = null;
  let bestVol = Infinity;

  for (const variant of variants) {
    for (const placed of [
      placedSideBySide(variant),
      placedSideBySideL(variant),
      placedStacked(variant),
      placedHybrid(variant),
    ]) {
      const v = vol(dimsOf(placed));
      if (v < bestVol) {
        bestVol = v;
        bestPlaced = placed;
      }
    }
  }

  return bestPlaced ?? [];
}

// ── Build labeled blocks ───────────────────────────────────────────────────────

function buildLabeledBlocks(
  items: Array<{ productName: string; quantity: number }>,
  byName: Record<string, ProductDim>
): { blocks: LabeledBlock[]; contentType: string; shoeCount: number } {
  const shoeBlocks: LabeledBlock[] = [];
  const clothingItems: Array<{ h: number; name: string }> = [];
  let accSmall = 0;
  let accLarge = 0;

  for (const { productName, quantity } of items) {
    const p = byName[productName];
    if (!p) continue;
    const type = classifyProduct(p.category || "", productName);

    if (type === "calcado") {
      const w = p.pkg_width_cm || 21.5;
      const l = p.pkg_length_cm || 36;
      const h = p.pkg_height_cm || 12.5;
      const svgKey = shoeSvgKey(productName);
      for (let i = 0; i < quantity; i++) {
        shoeBlocks.push({
          w, l, h, rigid: true, kind: "shoe_box",
          label: trunc(productName, 12),
          svgKey,
        });
      }
    } else if (type === "vestuario") {
      const h = p.pkg_height_cm || 4;
      for (let i = 0; i < quantity; i++) {
        clothingItems.push({ h, name: trunc(productName, 10) });
      }
    } else if (type === "acc_p") {
      accSmall += quantity;
    } else {
      accLarge += quantity;
    }
  }

  const hasShoes    = shoeBlocks.length > 0;
  const hasClothing = clothingItems.length > 0;
  const hasAcc      = accSmall > 0 || accLarge > 0;
  const onlyAcc     = !hasShoes && !hasClothing && hasAcc;

  const blocks: LabeledBlock[] = [...shoeBlocks];

  // Clothing → ziplocks with compression factor
  const rem = [...clothingItems];
  while (rem.length > 0) {
    if (rem.length === 1) {
      const item = rem.shift()!;
      blocks.push({
        ...ZIPLOCK_M_DIMS, h: item.h, rigid: false, kind: "ziplock_m",
        label: `ZIP M\n${item.name}`,
      });
    } else {
      const grp = rem.splice(0, 3);
      const fc = grp.length === 2 ? 0.8 : 0.7;
      const h = grp.reduce((s, g) => s + g.h, 0) * fc;
      blocks.push({
        ...ZIPLOCK_G_DIMS, h, rigid: false, kind: "ziplock_g",
        label: `ZIP G\n${grp.length} peças`,
      });
    }
  }

  // Accessories → ziplocks
  if (hasAcc) {
    if (onlyAcc) {
      if (accLarge > 0 && accSmall === 0) {
        blocks.push({ ...ZIPLOCK_M_DIMS, h: ACC_H, rigid: false, kind: "ziplock_m", label: "ZIP M\nAcess." });
      } else {
        blocks.push({ ...ZIPLOCK_P_DIMS, h: ACC_H, rigid: false, kind: "ziplock_p", label: "ZIP P\nAcess." });
        if (accSmall + accLarge >= 10) {
          blocks.push({ ...ZIPLOCK_P_DIMS, h: ACC_H, rigid: false, kind: "ziplock_p", label: "ZIP P\nAcess." });
        }
      }
    } else {
      if (accLarge > 0) {
        if (accSmall <= 3) {
          blocks.push({ ...ZIPLOCK_M_DIMS, h: ACC_H, rigid: false, kind: "ziplock_m", label: "ZIP M\nAcess." });
        } else {
          blocks.push({ ...ZIPLOCK_P_DIMS, h: ACC_H, rigid: false, kind: "ziplock_p", label: "ZIP P\nAcess." });
          blocks.push({ ...ZIPLOCK_M_DIMS, h: ACC_H, rigid: false, kind: "ziplock_m", label: "ZIP M\nAcess." });
        }
      } else if (accSmall > 0) {
        blocks.push({ ...ZIPLOCK_P_DIMS, h: ACC_H, rigid: false, kind: "ziplock_p", label: "ZIP P\nAcess." });
      }
    }
  }

  let contentType: string;
  if (hasShoes && !hasClothing && !hasAcc)     contentType = "only_shoes";
  else if (!hasShoes && hasClothing)            contentType = "only_clothing";
  else if (hasShoes && (hasClothing || hasAcc)) contentType = "shoes_clothing";
  else                                           contentType = "only_accessories";

  return { blocks, contentType, shoeCount: shoeBlocks.length };
}

// ── Envelope label ─────────────────────────────────────────────────────────────

function computeEnvelopeLabel(
  dims: { w: number; l: number; h: number },
  contentType: string,
  shoeCount: number
): { label: string; color: string } {
  let label: string;

  if (contentType === "only_shoes") {
    label = shoeCount <= 1 ? "Envelope P" : shoeCount === 2 ? "Envelope M" : "Envelope G";
  } else if (contentType === "only_clothing" || contentType === "only_accessories") {
    label = "Envelope G";
    for (const env of ENV_CLOTHING) {
      if (dims.w <= env.baseW && dims.l <= env.baseL && dims.h <= env.maxH) {
        label = `Envelope ${env.name}`;
        break;
      }
    }
  } else {
    label = shoeCount === 1 ? "Envelope M" : "Envelope G";
  }

  const color =
    label.includes("G") ? "bg-orange-100 text-orange-700" :
    label.includes("M") ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700";

  return { label, color };
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function computePackingLayout(
  items: Array<{ productName: string; quantity: number }>,
  products: ProductDim[]
): PackingLayout | null {
  if (!items.length || !products.length) return null;

  const byName: Record<string, ProductDim> = {};
  products.forEach(p => { byName[p.name] = p; });

  const { blocks, contentType, shoeCount } = buildLabeledBlocks(items, byName);
  if (!blocks.length) return null;

  const placed = bestPlacedLayout(blocks);
  const rawDims = dimsOf(placed);

  const dims = contentType === "only_shoes"
    ? {
        w: Math.ceil(Math.max(rawDims.w + 1, 10)),
        l: Math.ceil(Math.max(rawDims.l + 1, 10)),
        h: Math.ceil(Math.max(rawDims.h + 1, 1)),
      }
    : {
        w: Math.ceil(Math.max(rawDims.w, 10)),
        l: Math.ceil(Math.max(rawDims.l, 10)),
        h: Math.ceil(Math.max(rawDims.h, 1)),
      };

  const { label: envelopeLabel, color: envelopeColor } = computeEnvelopeLabel(dims, contentType, shoeCount);

  const weightKg = Math.max(
    items.reduce((sum, { productName, quantity }) => {
      const p = byName[productName];
      return sum + (p?.weight_g ?? 300) * quantity;
    }, 0) / 1000,
    0.1
  );

  return { envelopeLabel, envelopeColor, dims, weightKg, blocks: placed, contentType };
}
