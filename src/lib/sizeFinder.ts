/** Size finder: recommends garment size based on body measurements */

export interface SizeRecommendation {
  primary: string;
  bodyMeasurement: string | null; // e.g. "Tórax estimado: ~99 cm"
}

// ─── GARMENT MEASUREMENT TABLES ───────────────────────────────────────────
// All measurements in cm (original values × 100).
//
// Tables are in SIZE ORDER (smallest → largest). Do NOT sort by measurement —
// some products have measurement anomalies (PP chest > P chest from factory data);
// the table order is the authoritative size order.

interface ChestRow { size: string; chest: number }
interface WaistRow { size: string; halfWaist: number }

/**
 * Agasalho Gabardine Marrom Unissex – Largura = half-chest (× 2 = full)
 * 10:49×2=98 | 12:50×2=100 | 14:53×2=106 | P:55×2=110
 * M:59×2=118 | G:61×2=122  | GG:64×2=128 | EXG:68×2=136
 */
const AGASALHO: ChestRow[] = [
  { size: "10",  chest: 98 },
  { size: "12",  chest: 100 },
  { size: "14",  chest: 106 },
  { size: "P",   chest: 110 },
  { size: "M",   chest: 118 },
  { size: "G",   chest: 122 },
  { size: "GG",  chest: 128 },
  { size: "EXG", chest: 136 },
];

/**
 * Agasalho Tectel Marrom Unissex – Largura = half-chest (× 2 = full)
 * 10:46×2=92 | 12:48×2=96 | 14:50×2=100 | P:51×2=102
 * M:55×2=110 | G:58×2=116 | GG:60×2=120 | EXGG:66×2=132
 */
const AGASALHO_TECTEL: ChestRow[] = [
  { size: "10",   chest: 92 },
  { size: "12",   chest: 96 },
  { size: "14",   chest: 100 },
  { size: "P",    chest: 102 },
  { size: "M",    chest: 110 },
  { size: "G",    chest: 116 },
  { size: "GG",   chest: 120 },
  { size: "EXGG", chest: 132 },
];

/**
 * Camisete Branco Manga Longa Feminino – Busto = full circumference.
 * Factory anomaly: PP(90) > P(88). Table order defines size precedence.
 */
const CAMISETE_F: ChestRow[] = [
  { size: "PP",  chest: 90 },
  { size: "P",   chest: 88 },
  { size: "M",   chest: 94 },
  { size: "G",   chest: 100 },
  { size: "GG",  chest: 104 },
  { size: "EXG", chest: 112 },
];

/** Camisa Branca Manga Longa Masculina – Largura = full circumference */
const CAMISA_M: ChestRow[] = [
  { size: "PP",  chest: 106 },
  { size: "P",   chest: 108 },
  { size: "M",   chest: 114 },
  { size: "G",   chest: 120 },
  { size: "GG",  chest: 128 },
  { size: "EXG", chest: 132 },
];

/**
 * Camisa Social Bege Unissex – Largura × 2 = full circumference.
 * 10:43×2=86 | 12:45×2=90 | 14:48×2=96 | PP:51×2=102
 * P:54×2=108 | M:58×2=116 | G:60×2=120 | GG:63×2=126 | EXG:132
 * (EXG largura 1,32 fornecida como circunferência completa = 132 cm)
 */
const CAMISA_BEGE: ChestRow[] = [
  { size: "10",  chest: 86 },
  { size: "12",  chest: 90 },
  { size: "14",  chest: 96 },
  { size: "PP",  chest: 102 },
  { size: "P",   chest: 108 },
  { size: "M",   chest: 116 },
  { size: "G",   chest: 120 },
  { size: "GG",  chest: 126 },
  { size: "EXG", chest: 132 },
];

/**
 * Camiseta Bege Manga Curta Unissex – Largura × 2 = full circumference.
 * 10:40×2=80 | 12:43×2=86 | 14:46×2=92 | P:50×2=100
 * M:52×2=104 | G:57×2=114 | GG:61×2=122 | EXGG:65×2=130
 */
const CAMISETA_U: ChestRow[] = [
  { size: "10",   chest: 80 },
  { size: "12",   chest: 86 },
  { size: "14",   chest: 92 },
  { size: "P",    chest: 100 },
  { size: "M",    chest: 104 },
  { size: "G",    chest: 114 },
  { size: "GG",   chest: 122 },
  { size: "EXGG", chest: 130 },
];

/** Saia Marrom – Cintura = half-waist (cm) */
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
  { size: "52", halfWaist: 54 },
];

/**
 * Calça Tectel Marrom Unissex – Cintura = full circumference (cm); halfWaist = Cintura / 2.
 * 10:100/2=50 | 12:108/2=54 | 14:120/2=60 | P:124/2=62
 * M:132/2=66  | G:136/2=68  | GG:148/2=74 | EXG:152/2=76 | EXGG:154/2=77
 */
const CALCA_TECTEL: WaistRow[] = [
  { size: "10",   halfWaist: 50 },
  { size: "12",   halfWaist: 54 },
  { size: "14",   halfWaist: 60 },
  { size: "P",    halfWaist: 62 },
  { size: "M",    halfWaist: 66 },
  { size: "G",    halfWaist: 68 },
  { size: "GG",   halfWaist: 74 },
  { size: "EXG",  halfWaist: 76 },
  { size: "EXGG", halfWaist: 77 },
];

/** Calça Social Marrom – Cintura = half-waist (cm) */
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

/** Túnica Branca/Marrom Feminina – Busto = full circumference */
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
 * Túnica Branca/Marrom Masculina – Largura = full circumference.
 * Factory anomaly: PP(100) > P(96). Table order defines size precedence.
 * Size "12" = child size (largura 0.92 = 92 cm full).
 */
const TUNICA_M: ChestRow[] = [
  { size: "12",   chest: 92 },
  { size: "PP",   chest: 100 },
  { size: "P",    chest: 96 },  // anomaly: PP(100) > P(96)
  { size: "M",    chest: 106 },
  { size: "G",    chest: 108 },
  { size: "GG",   chest: 114 },
  { size: "EXG",  chest: 124 },
  { size: "EXGG", chest: 132 },
];

// ─── MINIMUM EASE PER PRODUCT TYPE ─────────────────────────────────────────
// Extra room (cm) the garment must have beyond the estimated body measurement.

const MIN_EASE: Record<string, number> = {
  "agasalho":        22, // loose gabardine tracksuit jacket (adjusted for manual sizes)
  "agasalho-tectel":  8, // sportswear jacket (tectel — slightly more fitted)
  "camisa-m":        10, // social shirt masculino
  "camisa-bege":     10, // social shirt unissex (same fit standard)
  "camisete-f":       2, // fitted blouse feminino
  "camiseta":         4, // casual unissex t-shirt
  "tunica-f":         4, // semi-fitted tunic feminino
  "tunica-m":         2, // tunic masculino (slightly fitted)
  "saia":             1, // +1 prevents garment ≤ body after rounding
  "calca":            1, // same rounding safety: ~2-4 cm full-waist ease
  "calca-tectel":     1, // elastic waistband — same rounding safety margin
};

// ─── PRODUCT TYPE DETECTION ────────────────────────────────────────────────

type ProductType =
  | "agasalho" | "agasalho-tectel"
  | "camisete-f" | "camisa-m" | "camisa-bege" | "camiseta"
  | "saia" | "calca" | "calca-tectel"
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

  if (n.includes("agasalho")) return n.includes("tectel") ? "agasalho-tectel" : "agasalho";
  if (n.includes("tunica"))   return gender === "m" ? "tunica-m" : "tunica-f";
  // "camiseta" must be checked before "camisete" and "camisa"
  if (n.includes("camiseta")) return "camiseta";
  if (n.includes("camisete")) return "camisete-f";
  if (n.includes("camisa")) {
    if (n.includes("bege")) return "camisa-bege";
    return gender === "m" ? "camisa-m" : "camisete-f";
  }
  if (n.includes("saia"))  return "saia";
  if (n.includes("calca")) return n.includes("tectel") ? "calca-tectel" : "calca";
  // Fallback: numeric sizes → treat as pants
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
  // Male reference points at 175 cm (chest / waist):
  //   BMI 20 → ~93 / ~72   (slim, PP range)
  //   BMI 22 → ~96 / ~76   (lean, P range)
  //   BMI 24 → ~100 / ~81  (average, M range)
  //   BMI 27 → ~104 / ~89  (above average, M→G border)
  //   BMI 29 → ~107 / ~94  (overweight, G→GG range)
  //
  // Female reference points at 165 cm (chest / waist):
  //   BMI 19 → ~84 / ~63
  //   BMI 21 → ~88 / ~68
  //   BMI 23 → ~93 / ~73
  //   BMI 25 → ~97 / ~78
  //   BMI 27 → ~101 / ~83
  //
  // Height correction: taller people have larger frames at the same BMI.
  // +0.2 cm per cm above/below reference height (175 m / 165 f).
  //
  let chest: number;
  let waist: number;

  if (g === "m") {
    chest = 91 + (bmi - 22) * 1.4 + (altura - 175) * 0.2;
    waist = 76 + (bmi - 22) * 2.6;
  } else {
    chest = 88 + (bmi - 21) * 2.2 + (altura - 165) * 0.2;
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

  } else if (type === "agasalho-tectel") {
    primary = matchChest(AGASALHO_TECTEL, body.chest, availableSizes, ease);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.chest)} cm`;

  } else if (type === "camisete-f") {
    primary = matchChest(CAMISETE_F, body.chest, availableSizes, ease);
    bodyMeasurement = `Busto estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "camisa-m") {
    primary = matchChest(CAMISA_M, body.chest, availableSizes, ease);
    bodyMeasurement = `Tórax estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "camisa-bege") {
    primary = matchChest(CAMISA_BEGE, body.chest, availableSizes, ease);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.chest)} cm`;

  } else if (type === "camiseta") {
    primary = matchChest(CAMISETA_U, body.chest, availableSizes, ease);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.chest)} cm`;

  } else if (type === "saia") {
    primary = matchWaist(SAIA, body.halfWaist, availableSizes, ease);
    bodyMeasurement = `Cintura estimada: ~${Math.round(body.waist)} cm`;

  } else if (type === "calca-tectel") {
    primary = matchWaist(CALCA_TECTEL, body.halfWaist, availableSizes, ease);
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
