// Packing recommendation utility — mirrors the algorithm in melhor-envio-quote/index.ts

interface Block { w: number; l: number; h: number; rigid: boolean; }

const ZIPLOCK_M = { w: 25, l: 35 };
const ZIPLOCK_G = { w: 30, l: 40 };
const ZIPLOCK_P = { w: 18, l: 25 };
const ACC_H = 6;

// Smallest envelope that fits clothing/accessories (base útil × altura máx)
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
}

export interface PackageLabel {
  label: string;
  color: string;
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

function buildClothingBlocks(heightsPerPiece: number[]): Block[] {
  const blocks: Block[] = [];
  let rem = [...heightsPerPiece];
  while (rem.length > 0) {
    if (rem.length === 1) {
      blocks.push({ ...ZIPLOCK_M, h: rem.shift()!, rigid: false });
    } else {
      const grp = rem.splice(0, 3);
      const fc = grp.length === 2 ? 0.8 : 0.7;
      blocks.push({ ...ZIPLOCK_G, h: grp.reduce((s, h) => s + h, 0) * fc, rigid: false });
    }
  }
  return blocks;
}

function smallestClothingEnvelope(blocks: Block[]): string {
  const totalH = blocks.reduce((s, b) => s + b.h, 0);
  const maxW = blocks.reduce((m, b) => Math.max(m, b.w), 0);
  const maxL = blocks.reduce((m, b) => Math.max(m, b.l), 0);
  for (const env of ENV_CLOTHING) {
    if (maxW <= env.baseW && maxL <= env.baseL && totalH <= env.maxH) return env.name;
  }
  return "G";
}

export function getPackageLabel(
  items: Array<{ productName: string; quantity: number }>,
  products: ProductDim[]
): PackageLabel {
  if (!items.length || !products.length) return { label: "—", color: "bg-gray-100 text-gray-500" };

  const byName: Record<string, ProductDim> = {};
  products.forEach(p => { byName[p.name] = p; });

  let shoeCount = 0;
  const clothingH: number[] = [];
  let accSmall = 0;
  let accLarge = 0;

  for (const { productName, quantity } of items) {
    const p = byName[productName];
    if (!p) continue;
    const type = classifyProduct(p.category || "", productName);
    if (type === "calcado") {
      shoeCount += quantity;
    } else if (type === "vestuario") {
      const h = p.pkg_height_cm || 4;
      for (let i = 0; i < quantity; i++) clothingH.push(h);
    } else if (type === "acc_p") {
      accSmall += quantity;
    } else {
      accLarge += quantity;
    }
  }

  const hasShoes = shoeCount > 0;
  const hasClothing = clothingH.length > 0;
  const hasAcc = accSmall > 0 || accLarge > 0;

  let label: string;

  if (hasShoes && !hasClothing && !hasAcc) {
    // Shoes only
    if (shoeCount === 1) label = "Envelope P";
    else if (shoeCount === 2) label = "Envelope M";
    else label = "Envelope G";
  } else if (!hasShoes && !hasAcc && hasClothing) {
    // Clothing only
    const blocks = buildClothingBlocks(clothingH);
    label = `Envelope ${smallestClothingEnvelope(blocks)}`;
  } else if (!hasShoes && !hasClothing && hasAcc) {
    // Accessories only
    if (accLarge > 0 && accSmall === 0) label = "Envelope M";
    else if (accSmall + accLarge >= 10) label = "2× Envelope P";
    else label = "Envelope P";
  } else if (hasShoes && (hasClothing || hasAcc)) {
    // Mixed: shoes + clothing or accessories
    label = shoeCount === 1 ? "Envelope M" : "Envelope G";
  } else {
    // Only accessories mixed with clothing
    const blocks = buildClothingBlocks(clothingH);
    label = `Envelope ${smallestClothingEnvelope(blocks)}`;
  }

  const color =
    label.includes("G") ? "bg-orange-100 text-orange-700" :
    label.includes("M") ? "bg-blue-100 text-blue-700" :
    label === "—"       ? "bg-gray-100 text-gray-500" :
                          "bg-green-100 text-green-700";

  return { label, color };
}
