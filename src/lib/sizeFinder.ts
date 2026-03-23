/** Size finder: recommends garment size based on body measurements */

export interface SizeRecommendation {
  primary: string;
  alternative: string | null;
  bodyMeasurement: string | null;
}

// ─── GARMENT MEASUREMENT TABLES ───────────────────────────────────────────
// All measurements in cm (original values × 100)
// Tables are in SIZE ORDER (smallest → largest) — do NOT sort by measurement.
// Some products have measurement anomalies (e.g. PP chest > P chest) that
// reflect real factory data; the table order is what defines "size order".

interface ChestRow { size: string; chest: number }
interface WaistRow { size: string; halfWaist: number }

/** Agasalho Gabardine – Largura = half-chest width (×2 = full circumference) */
const AGASALHO: ChestRow[] = [
  { size: "M",    chest: 59 * 2 },  // 118
  { size: "G",    chest: 61 * 2 },  // 122
  { size: "GG",   chest: 64 * 2 },  // 128
  { size: "EXGG", chest: 68 * 2 },  // 136
];

/**
 * Camisete Social (Feminino) – Busto = full circumference.
 * Note: PP(90) > P(88) in the garment data — this is a factory anomaly;
 * table order (PP before P) defines size precedence.
 */
const CAMISETE_F: ChestRow[] = [
  { size: "PP",   chest: 90 },
  { size: "P",    chest: 88 },
  { size: "M",    chest: 94 },
  { size: "G",    chest: 100 },
  { size: "GG",   chest: 104 },
  { size: "EXGG", chest: 112 },
];

/** Camisa Social (Masculino) – Largura = full circumference */
const CAMISA_M: ChestRow[] = [
  { size: "PP",   chest: 106 },
  { size: "P",    chest: 108 },
  { size: "M",    chest: 114 },
  { size: "G",    chest: 120 },
  { size: "GG",   chest: 128 },
  { size: "EXGG", chest: 132 },
];

/** Saia Social – Cintura = half-waist (cm) */
const SAIA: WaistRow[] = [
  { size: "30", halfWaist: 30 },
  { size: "32", halfWaist: 31 },
  { size: "34", halfWaist: 33 },
  { size: "36", halfWaist: 37 },
  { size: "38", halfWaist: 39 },
  { size: "40", halfWaist: 42 },
  { size: "42", halfWaist: 44 },
  { size: "44", halfWaist: 45 },
  { size: "46", halfWaist: 48 },
  { size: "48", halfWaist: 50 },
  { size: "50", halfWaist: 52 },
  { size: "52", halfWaist: 54 }, // interpolated – measurement not provided
];

/** Calça Social – Cintura = half-waist (cm) */
const CALCA: WaistRow[] = [
  { size: "30", halfWaist: 30 },
  { size: "32", halfWaist: 32 },
  { size: "34", halfWaist: 34 },
  { size: "36", halfWaist: 36 },
  { size: "38", halfWaist: 38 },
  { size: "40", halfWaist: 40 },
  { size: "42", halfWaist: 42 },
  { size: "44", halfWaist: 44 },
  { size: "46", halfWaist: 46 },
  { size: "48", halfWaist: 48 },
  { size: "50", halfWaist: 50 },
  { size: "52", halfWaist: 52 },
  { size: "54", halfWaist: 54 },
  { size: "56", halfWaist: 56 },
];

/** Túnica Feminina – Busto = full circumference */
const TUNICA_F: ChestRow[] = [
  { size: "PP",   chest: 90 },
  { size: "P",    chest: 94 },
  { size: "M",    chest: 98 },
  { size: "G",    chest: 104 },
  { size: "GG",   chest: 106 },
  { size: "EXG",  chest: 114 },
  { size: "EXGG", chest: 122 },
];

/**
 * Túnica Masculina – Largura = full circumference.
 * Note: PP(100) > P(96) — same factory anomaly as Camisete F.
 */
const TUNICA_M: ChestRow[] = [
  { size: "PPP",  chest: 92 },
  { size: "PP",   chest: 100 },
  { size: "P",    chest: 96 },
  { size: "M",    chest: 106 },
  { size: "G",    chest: 108 },
  { size: "GG",   chest: 114 },
  { size: "EXG",  chest: 124 },
  { size: "EXGG", chest: 132 },
];

// ─── MINIMUM EASE PER PRODUCT TYPE ─────────────────────────────────────────
// How much extra room (cm) the garment must have beyond the body measurement.
// Social shirts need 12cm; fitted tops 2cm; loose jackets 8cm; waist 0cm.

const MIN_EASE: Record<string, number> = {
  "agasalho":   8,
  "camisa-m":  12,
  "camisete-f": 2,
  "tunica-f":   6,
  "tunica-m":   8,
  "saia":       0,
  "calca":      0,
};

// ─── PRODUCT TYPE ──────────────────────────────────────────────────────────

type ProductType =
  | "agasalho" | "camisete-f" | "camisa-m"
  | "saia"     | "calca"
  | "tunica-f" | "tunica-m"
  | "generic";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function detectProductType(
  productName: string,
  gender: "m" | "f" | null,
  availableSizes: string[]
): ProductType {
  const n = normalize(productName);
  if (n.includes("agasalho")) return "agasalho";
  if (n.includes("tunica"))   return gender === "m" ? "tunica-m" : "tunica-f";
  if (n.includes("camisete")) return "camisete-f";
  if (n.includes("camisa"))   return gender === "m" ? "camisa-m" : "camisete-f";
  if (n.includes("saia"))     return "saia";
  if (n.includes("calca"))    return "calca";
  if (availableSizes.some(s => /^\d+$/.test(s))) return "calca";
  return "generic";
}

// ─── BODY ESTIMATION ───────────────────────────────────────────────────────

function estimateBody(
  altura: number,
  peso: number,
  gender: "m" | "f" | null,
  caimento: "justo" | "regular" | "oversize" | null
) {
  const h = altura / 100;
  const bmi = peso / (h * h);
  const g = gender ?? "m";

  let chest: number;
  let waist: number;

  if (g === "m") {
    // Male: calibrated to Brazilian NBR body size ranges
    chest = 92 + (bmi - 22) * 2.5;
    waist = 80 + (bmi - 22) * 3.0;
  } else {
    // Female: calibrated to Brazilian NBR body size ranges
    chest = 88 + (bmi - 21) * 2.2;
    waist = 70 + (bmi - 21) * 2.5;
  }

  // Ectomorph (justo): lean frame → smaller estimates
  // Endomorph (oversize): stocky frame → larger estimates
  if (caimento === "justo") {
    chest -= 4;
    waist -= 3;
  } else if (caimento === "oversize") {
    chest += 4;
    waist += 5;
  }

  chest = Math.max(78, Math.min(145, chest));
  waist = Math.max(56, Math.min(130, waist));

  return { chest, waist, halfWaist: waist / 2, bmi };
}

// ─── SIZE MATCHING ─────────────────────────────────────────────────────────
// IMPORTANT: iterate table in its original order (= size order).
// Do NOT sort by chest measurement — some products have inverted measurements
// (PP chest > P chest) and the table order is the authoritative size order.

function matchChest(
  table: ChestRow[],
  bodyChest: number,
  availableSizes: string[],
  minEase: number
): { primary: ChestRow | null; alternative: ChestRow | null } {
  // Keep table order — only filter to available sizes preserving sequence
  const rows = table.filter(r => availableSizes.includes(r.size));
  if (rows.length === 0) return { primary: null, alternative: null };

  const needed = bodyChest + minEase;

  // First size (in size order) whose garment chest meets the needed threshold
  const primaryIdx = rows.findIndex(r => r.chest >= needed);

  if (primaryIdx === -1) {
    // Body is too large even for the biggest size → recommend biggest
    return { primary: rows[rows.length - 1], alternative: null };
  }

  const primary = rows[primaryIdx];
  // Suggest the next size up as alternative when the fit is very close
  const nextUp = rows[primaryIdx + 1] ?? null;
  const alternative =
    nextUp && primary.chest - bodyChest <= minEase + 4 ? nextUp : null;

  return { primary, alternative };
}

function matchWaist(
  table: WaistRow[],
  halfBodyWaist: number,
  availableSizes: string[],
  minEase: number
): { primary: WaistRow | null; alternative: WaistRow | null } {
  const rows = table.filter(r => availableSizes.includes(r.size));
  if (rows.length === 0) return { primary: null, alternative: null };

  const needed = halfBodyWaist + minEase;

  const primaryIdx = rows.findIndex(r => r.halfWaist >= needed);

  if (primaryIdx === -1) {
    return { primary: rows[rows.length - 1], alternative: null };
  }

  const primary = rows[primaryIdx];
  const nextUp = rows[primaryIdx + 1] ?? null;
  const alternative =
    nextUp && primary.halfWaist - halfBodyWaist <= minEase + 2 ? nextUp : null;

  return { primary, alternative };
}

// Generic letter-size fallback using BMI
function genericLetterSize(
  bmi: number,
  gender: "m" | "f" | null,
  caimento: "justo" | "regular" | "oversize" | null,
  availableSizes: string[]
): string {
  const order = ["PPP", "PP", "P", "M", "G", "GG", "EXG", "EXGG"];
  const g = gender ?? "m";
  const adj = g === "f" ? -0.5 : 0;
  const fitAdj = caimento === "justo" ? -1 : caimento === "oversize" ? 1 : 0;
  const score = bmi + adj + fitAdj;

  let target: string;
  if (score < 18.5)     target = "PP";
  else if (score < 21)  target = "P";
  else if (score < 24)  target = "M";
  else if (score < 27)  target = "G";
  else if (score < 30)  target = "GG";
  else                  target = "EXGG";

  if (availableSizes.includes(target)) return target;
  const idx = order.indexOf(target);
  for (let d = 1; d < order.length; d++) {
    if (idx + d < order.length && availableSizes.includes(order[idx + d])) return order[idx + d];
    if (idx - d >= 0 && availableSizes.includes(order[idx - d])) return order[idx - d];
  }
  return availableSizes[0];
}

// ─── PUBLIC API ────────────────────────────────────────────────────────────

export function recommendSize(
  productName: string,
  gender: "m" | "f" | null,
  caimento: "justo" | "regular" | "oversize" | null,
  altura: number,
  peso: number,
  availableSizes: string[]
): SizeRecommendation {
  if (availableSizes.length === 0) {
    return { primary: "M", alternative: null, bodyMeasurement: null };
  }

  const type = detectProductType(productName, gender, availableSizes);
  const body = estimateBody(altura, peso, gender, caimento);
  const ease = MIN_EASE[type] ?? 0;

  const chestLabel = gender === "f" ? "Busto estimado" : "Tórax estimado";

  let primary: string | null = null;
  let alternative: string | null = null;
  let bodyMeasurement: string | null = null;

  if (type === "agasalho") {
    const r = matchChest(AGASALHO, body.chest, availableSizes, ease);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.chest)} cm`;

  } else if (type === "camisete-f") {
    const r = matchChest(CAMISETE_F, body.chest, availableSizes, ease);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Busto estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "camisa-m") {
    const r = matchChest(CAMISA_M, body.chest, availableSizes, ease);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Tórax estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "saia") {
    const r = matchWaist(SAIA, body.halfWaist, availableSizes, ease);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Cintura estimada: ~${Math.round(body.waist)} cm`;

  } else if (type === "calca") {
    const r = matchWaist(CALCA, body.halfWaist, availableSizes, ease);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Cintura estimada: ~${Math.round(body.waist)} cm`;

  } else if (type === "tunica-f") {
    const r = matchChest(TUNICA_F, body.chest, availableSizes, ease);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Busto estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "tunica-m") {
    const r = matchChest(TUNICA_M, body.chest, availableSizes, ease);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Tórax estimado: ~${Math.round(body.chest)} cm`;
  }

  // Generic fallback
  if (!primary) {
    primary = genericLetterSize(body.bmi, gender, caimento, availableSizes);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.chest)} cm`;
  }

  return { primary, alternative, bodyMeasurement };
}
