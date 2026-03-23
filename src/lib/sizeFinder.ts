/** Size finder: recommends garment size based on body measurements */

export interface SizeRecommendation {
  primary: string;
  bodyMeasurement: string | null; // e.g. "Tórax estimado: ~99 cm"
}

// ─── GARMENT MEASUREMENT TABLES ───────────────────────────────────────────
// All measurements in cm (original values × 100)
//
// Tables are in SIZE ORDER (smallest → largest). Do NOT sort by measurement —
// some products have measurement anomalies (PP chest > P chest from factory data);
// the table order is the authoritative size order.

interface ChestRow { size: string; chest: number }
interface WaistRow { size: string; halfWaist: number }

/**
 * Agasalho Gabardine – Largura = half-chest width (× 2 = full circumference)
 * M:59×2=118 | G:61×2=122 | GG:64×2=128 | EXGG:68×2=136
 */
const AGASALHO: ChestRow[] = [
  { size: "M",    chest: 118 },
  { size: "G",    chest: 122 },
  { size: "GG",   chest: 128 },
  { size: "EXGG", chest: 136 },
];

/**
 * Camisete Social (Feminino) – Busto = full circumference.
 * Factory anomaly: PP(90) > P(88). Table order defines size precedence.
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
  { size: "52", halfWaist: 54 }, // interpolated — measurement not provided
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
 * Factory anomaly: PP(100) > P(96). Table order defines size precedence.
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
// Extra room (cm) the garment must have beyond the estimated body measurement.
// Calibrated so that a 175cm/74kg male → M shirt, 175cm/80kg → M, 165cm/60kg female → M camisete.

const MIN_EASE: Record<string, number> = {
  "agasalho":   10, // loose tracksuit jacket
  "camisa-m":   10, // social shirt (formal, loose fit for uniforms)
  "camisete-f":  2, // fitted blouse
  "tunica-f":    4, // semi-fitted tunic
  "tunica-m":    2, // tunic (slightly fitted)
  "saia":        0, // waist is exact measurement
  "calca":       0, // waist is exact measurement
};

// ─── PRODUCT TYPE DETECTION ────────────────────────────────────────────────

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
  // Fallback: if sizes are numeric treat as pants
  if (availableSizes.some(s => /^\d+$/.test(s))) return "calca";
  return "generic";
}

// ─── BODY MEASUREMENT ESTIMATION ──────────────────────────────────────────
// Calibrated against Brazilian NBR 15800 sizing standard body ranges.

function estimateBody(
  altura: number,
  peso: number,
  gender: "m" | "f" | null,
  caimento: "justo" | "regular" | "oversize" | null
) {
  const h = altura / 100;
  const bmi = peso / (h * h);
  const g = gender ?? "m";

  //
  // Male reference points (chest / waist):
  //   BMI 20 → ~89 / ~72   (slim, PP shirt range)
  //   BMI 22 → ~94 / ~77   (lean-normal, P range)
  //   BMI 24 → ~99 / ~82   (average, M range)
  //   BMI 26 → ~103 / ~87  (above average, G range)
  //   BMI 28 → ~107 / ~92  (overweight, GG range)
  //
  // Female reference points (chest / waist):
  //   BMI 19 → ~84 / ~63
  //   BMI 21 → ~88 / ~68
  //   BMI 23 → ~93 / ~73
  //   BMI 25 → ~97 / ~78
  //   BMI 27 → ~101 / ~83
  //
  let chest: number;
  let waist: number;

  if (g === "m") {
    chest = 94 + (bmi - 22) * 2.2;
    waist = 76 + (bmi - 22) * 2.6;
  } else {
    chest = 88 + (bmi - 21) * 2.2;
    waist = 68 + (bmi - 21) * 2.3;
  }

  // Body type adjustment (±1 size in most cases):
  // Ectomorfo (justo):   lean frame → chest is relatively smaller for same BMI
  // Endomorfo (oversize): stocky frame → waist is relatively larger for same BMI
  if (caimento === "justo") {
    chest -= 2;
    waist -= 2;
  } else if (caimento === "oversize") {
    chest += 2;
    waist += 4;
  }

  chest = Math.max(78, Math.min(145, chest));
  waist = Math.max(56, Math.min(130, waist));

  return { chest, waist, halfWaist: waist / 2, bmi };
}

// ─── SIZE MATCHING ─────────────────────────────────────────────────────────
// CRITICAL: iterate table in original order (= size order), NOT sorted by measurement.
// Body measurement is rounded to integer to prevent floating-point boundary issues
// (e.g., chest 102.3 vs garment 114 with ease 12 = 114.3 → rounds to 114, recommends M correctly).

function matchChest(
  table: ChestRow[],
  bodyChest: number,
  availableSizes: string[],
  minEase: number
): string | null {
  const rows = table.filter(r => availableSizes.includes(r.size));
  if (rows.length === 0) return null;

  const needed = Math.round(bodyChest) + minEase;

  const idx = rows.findIndex(r => r.chest >= needed);
  if (idx === -1) return rows[rows.length - 1].size; // largest available
  return rows[idx].size;
}

function matchWaist(
  table: WaistRow[],
  halfBodyWaist: number,
  availableSizes: string[],
  minEase: number
): string | null {
  const rows = table.filter(r => availableSizes.includes(r.size));
  if (rows.length === 0) return null;

  const needed = Math.round(halfBodyWaist) + minEase;

  const idx = rows.findIndex(r => r.halfWaist >= needed);
  if (idx === -1) return rows[rows.length - 1].size;
  return rows[idx].size;
}

// Generic letter-size fallback (used when product type is unrecognized)
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
    if (idx - d >= 0     && availableSizes.includes(order[idx - d])) return order[idx - d];
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
    return { primary: "M", bodyMeasurement: null };
  }

  const type = detectProductType(productName, gender, availableSizes);
  const body = estimateBody(altura, peso, gender, caimento);
  const ease = MIN_EASE[type] ?? 0;

  const chestLabel = gender === "f" ? "Busto estimado" : "Tórax estimado";
  let primary: string | null = null;
  let bodyMeasurement: string | null = null;

  if (type === "agasalho") {
    primary = matchChest(AGASALHO, body.chest, availableSizes, ease);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.chest)} cm`;

  } else if (type === "camisete-f") {
    primary = matchChest(CAMISETE_F, body.chest, availableSizes, ease);
    bodyMeasurement = `Busto estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "camisa-m") {
    primary = matchChest(CAMISA_M, body.chest, availableSizes, ease);
    bodyMeasurement = `Tórax estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "saia") {
    primary = matchWaist(SAIA, body.halfWaist, availableSizes, ease);
    bodyMeasurement = `Cintura estimada: ~${Math.round(body.waist)} cm`;

  } else if (type === "calca") {
    primary = matchWaist(CALCA, body.halfWaist, availableSizes, ease);
    bodyMeasurement = `Cintura estimada: ~${Math.round(body.waist)} cm`;

  } else if (type === "tunica-f") {
    primary = matchChest(TUNICA_F, body.chest, availableSizes, ease);
    bodyMeasurement = `Busto estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "tunica-m") {
    primary = matchChest(TUNICA_M, body.chest, availableSizes, ease);
    bodyMeasurement = `Tórax estimado: ~${Math.round(body.chest)} cm`;
  }

  // Generic fallback for unrecognized product types
  if (!primary) {
    primary = genericLetterSize(body.bmi, gender, caimento, availableSizes);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.chest)} cm`;
  }

  return { primary, bodyMeasurement };
}
