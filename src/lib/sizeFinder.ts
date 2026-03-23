/** Size finder: recommends garment size based on body measurements */

export interface SizeRecommendation {
  primary: string;
  alternative: string | null;
  bodyMeasurement: string | null; // e.g. "Busto estimado: ~96 cm"
}

// ─── GARMENT MEASUREMENT TABLES ───────────────────────────────────────────
// All measurements in cm (original values × 100)

interface ChestRow { size: string; chest: number }  // full chest circumference
interface WaistRow { size: string; halfWaist: number } // half waist (garment cintura)

/** Agasalho Gabardine – Largura = half-chest (width when laid flat) → ×2 */
const AGASALHO: ChestRow[] = [
  { size: "M",    chest: 59 * 2 },   // 118
  { size: "G",    chest: 61 * 2 },   // 122
  { size: "GG",   chest: 64 * 2 },   // 128
  { size: "EXGG", chest: 68 * 2 },   // 136
];

/** Camisete Social (Feminino) – Busto = full circumference */
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
  { size: "52", halfWaist: 54 }, // interpolated (measurement not provided)
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

/** Túnica Masculina – Largura = full circumference */
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

// ─── PRODUCT TYPE ──────────────────────────────────────────────────────────

type ProductType =
  | "agasalho"
  | "camisete-f"
  | "camisa-m"
  | "saia"
  | "calca"
  | "tunica-f"
  | "tunica-m"
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
  if (n.includes("tunica")) return gender === "m" ? "tunica-m" : "tunica-f";
  if (n.includes("camisete")) return "camisete-f";
  if (n.includes("camisa")) return gender === "m" ? "camisa-m" : "camisete-f";
  if (n.includes("saia")) return "saia";
  if (n.includes("calca")) return "calca";
  // Fallback: numeric sizes → treat as pants
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

  // BMI-based chest and waist estimation
  let chest = g === "m"
    ? 92 + (bmi - 22) * 2.5
    : 88 + (bmi - 21) * 2.2;

  let waist = g === "m"
    ? 80 + (bmi - 22) * 3.0
    : 70 + (bmi - 21) * 2.5;

  // Body type / fit preference adjustment
  if (caimento === "justo") {
    // Ectomorph: naturally leaner proportions
    chest -= 4;
    waist -= 3;
  } else if (caimento === "oversize") {
    // Endomorph: naturally stockier proportions
    chest += 4;
    waist += 5;
  }

  chest = Math.max(78, Math.min(145, chest));
  waist = Math.max(56, Math.min(130, waist));

  return { chest, waist, halfWaist: waist / 2, bmi };
}

// ─── SIZE MATCHING ─────────────────────────────────────────────────────────

function matchChest(
  table: ChestRow[],
  bodyChest: number,
  availableSizes: string[]
): { primary: ChestRow | null; alternative: ChestRow | null } {
  const rows = table
    .filter(r => availableSizes.includes(r.size))
    .sort((a, b) => a.chest - b.chest);

  if (rows.length === 0) return { primary: null, alternative: null };

  // Smallest garment that fits (garment chest ≥ body chest)
  const fitting = rows.filter(r => r.chest >= bodyChest);
  if (fitting.length === 0) return { primary: rows[rows.length - 1], alternative: null };

  const primary = fitting[0];
  const idx = rows.indexOf(primary);

  // Suggest one size down as alternative if very close to boundary (≤6 cm ease)
  const alternative = idx > 0 && primary.chest - bodyChest <= 6
    ? rows[idx - 1]
    : null;

  return { primary, alternative };
}

function matchWaist(
  table: WaistRow[],
  halfBodyWaist: number,
  availableSizes: string[]
): { primary: WaistRow | null; alternative: WaistRow | null } {
  const rows = table
    .filter(r => availableSizes.includes(r.size))
    .sort((a, b) => a.halfWaist - b.halfWaist);

  if (rows.length === 0) return { primary: null, alternative: null };

  const fitting = rows.filter(r => r.halfWaist >= halfBodyWaist);
  if (fitting.length === 0) return { primary: rows[rows.length - 1], alternative: null };

  const primary = fitting[0];
  const idx = rows.indexOf(primary);

  const alternative = idx > 0 && primary.halfWaist - halfBodyWaist <= 2
    ? rows[idx - 1]
    : null;

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
  if (score < 18.5) target = "PP";
  else if (score < 21)  target = "P";
  else if (score < 24)  target = "M";
  else if (score < 27)  target = "G";
  else if (score < 30)  target = "GG";
  else target = "EXGG";

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

  let primary: string | null = null;
  let alternative: string | null = null;
  let bodyMeasurement: string | null = null;

  const chestLabel = gender === "f" ? "Busto estimado" : "Tórax estimado";
  const waistLabel = "Cintura estimada";

  if (type === "agasalho") {
    const r = matchChest(AGASALHO, body.chest, availableSizes);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.chest)} cm`;

  } else if (type === "camisete-f") {
    const r = matchChest(CAMISETE_F, body.chest, availableSizes);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Busto estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "camisa-m") {
    const r = matchChest(CAMISA_M, body.chest, availableSizes);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Tórax estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "saia") {
    const r = matchWaist(SAIA, body.halfWaist, availableSizes);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `${waistLabel}: ~${Math.round(body.waist)} cm`;

  } else if (type === "calca") {
    const r = matchWaist(CALCA, body.halfWaist, availableSizes);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `${waistLabel}: ~${Math.round(body.waist)} cm`;

  } else if (type === "tunica-f") {
    const r = matchChest(TUNICA_F, body.chest, availableSizes);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Busto estimado: ~${Math.round(body.chest)} cm`;

  } else if (type === "tunica-m") {
    const r = matchChest(TUNICA_M, body.chest, availableSizes);
    primary = r.primary?.size ?? null;
    alternative = r.alternative?.size ?? null;
    bodyMeasurement = `Tórax estimado: ~${Math.round(body.chest)} cm`;
  }

  // Generic fallback
  if (!primary) {
    primary = genericLetterSize(body.bmi, gender, caimento, availableSizes);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.chest)} cm`;
  }

  return {
    primary,
    alternative,
    bodyMeasurement,
  };
}
