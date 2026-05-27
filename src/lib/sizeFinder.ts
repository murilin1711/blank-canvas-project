/** Size finder: recommends garment size based on body measurements */

import type { BodyDominance } from './volumetry';
export type { BodyDominance };

// ─── PUBLIC INTERFACES ────────────────────────────────────────────────────────

export interface BodyAdjustments {
  toraxAdj: number;    // male = tórax; female = busto. clicks: -3 to +3
  cinturaAdj: number;
  quadrilAdj: number;
  gluteoAdj: number;
  coxaAdj: number;
}

export const DEFAULT_ADJUSTMENTS: BodyAdjustments = {
  toraxAdj: 0,
  cinturaAdj: 0,
  quadrilAdj: 0,
  gluteoAdj: 0,
  coxaAdj: 0,
};

export interface BodyMeasurements {
  torax: number;    // tórax (m) or busto (f) — full circumference cm
  cintura: number;
  quadril: number;
  coxa: number;
  ombro: number;    // internal — not shown to user
  braco: number;    // internal
  gancho: number;   // internal
}

export type FitStatus = 'ideal' | 'levemente-justo' | 'apertado' | 'levemente-folgado' | 'folgado';

export interface RegionFit {
  label: string;
  status: FitStatus;
  ease: number;     // garment − body (cm)
}

export interface SizeRecommendation {
  primary: string;
  bodyMeasurement: string | null;  // e.g. "Tórax estimado: ~99 cm"
  fits?: RegionFit[];
}

// ─── GARMENT MEASUREMENT TABLES ───────────────────────────────────────────────
// All measurements in cm.
// Tables are in SIZE ORDER (smallest → largest). Do NOT sort by measurement —
// some products have factory anomalies (PP chest > P chest); table order is
// the authoritative size order.

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
 * Size "12" = child size (92 cm full).
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

// ─── MINIMUM EASE PER PRODUCT TYPE ────────────────────────────────────────────
// Extra room (cm) the garment must have beyond the estimated body measurement.
// Calibrated against the new body-estimation formulas (non-BMI).
// Confirmed test cases: Samuel 175/82 kg, Eduardo 174/76 kg.

const MIN_EASE: Record<string, number> = {
  "agasalho":        10, // structured gabardine jacket
  "agasalho-tectel":  6, // tectel jacket
  "camisa-m":         6, // social shirt masculino
  "camisa-bege":      6, // social shirt unissex
  "camisete-f":       0, // fitted blouse feminino
  "camiseta":         2, // casual unissex t-shirt (modelagem pequena — sobe tamanho)
  "tunica-f":         4, // semi-fitted tunic feminino
  "tunica-m":         2, // tunic masculino (ombro is real size driver — limitation)
  "saia":             1, // rounding safety
  "calca":            3, // military dress pants — match by cintura halfWaist
  "calca-tectel":    23, // elastic tectel — large garment ease by design
};

// ─── PRODUCT TYPE DETECTION ────────────────────────────────────────────────────

type ProductType =
  | "agasalho" | "agasalho-tectel"
  | "camisete-f" | "camisa-m" | "camisa-bege" | "camiseta"
  | "saia" | "calca" | "calca-tectel"
  | "tunica-f" | "tunica-m"
  | "generic";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function detectProductType(
  productName: string,
  gender: "m" | "f" | null,
  availableSizes: string[]
): ProductType {
  const n = normalize(productName);

  if (
    n.includes("agasalho") ||
    n.includes("conjunto") ||
    n.includes("jaqueta") ||
    n.includes("moletom") ||
    n.includes("blusa de frio")
  ) {
    return n.includes("tectel") ? "agasalho-tectel" : "agasalho";
  }

  if (n.includes("tunica") || n.includes("blusa")) {
    return gender === "m" ? "tunica-m" : "tunica-f";
  }

  if (
    n.includes("calca") ||
    n.includes("bermuda") ||
    n.includes("short") ||
    n.includes("shorts")
  ) {
    return n.includes("tectel") ? "calca-tectel" : "calca";
  }

  if (n.includes("saia")) return "saia";

  if (
    n.includes("camiseta") ||
    n.includes("camisao") ||
    n.includes("polo")
  ) return "camiseta";

  if (n.includes("camisete")) return "camisete-f";

  if (n.includes("camisa") || n.includes("social")) {
    if (n.includes("bege") || n.includes("unissex")) return "camisa-bege";
    return gender === "m" ? "camisa-m" : "camisete-f";
  }

  if (availableSizes.some(s => /^\d+$/.test(s))) {
    return gender === "f" ? "saia" : "calca";
  }

  return "generic";
}

// ─── BODY MEASUREMENT ESTIMATION ──────────────────────────────────────────────
// Formulas calibrated against real test cases (Samuel 175/82, Eduardo 174/76).
// Adjustment deltas per click (spec values, asymmetric +/−).

function applyAdj(
  base: number,
  clicks: number,
  plusPerClick: number,
  minusPerClick: number
): number {
  if (clicks >= 0) return base + clicks * plusPerClick;
  return base - Math.abs(clicks) * minusPerClick;
}

// Deslocamentos de distribuição corporal (cm) sobre as estimativas base.
// Preserva o resultado atual quando dominance = 'equilibrado'.
const DOMINANCE_BODY_DELTA: Record<BodyDominance, {
  torax: number; cintura: number; quadril: number; coxa: number;
}> = {
  tronco:      { torax:  5, cintura:  2, quadril: -3, coxa: -2 },
  inferior:    { torax: -4, cintura:  2, quadril:  6, coxa:  4 },
  equilibrado: { torax:  0, cintura:  0, quadril:  0, coxa:  0 },
};

export function estimateBody(
  altura: number,
  peso: number,
  gender: "m" | "f" | null,
  adjustments: BodyAdjustments = DEFAULT_ADJUSTMENTS,
  dominance: BodyDominance = 'equilibrado',
): BodyMeasurements {
  const g = gender ?? "m";
  const adj = adjustments;
  const dom = DOMINANCE_BODY_DELTA[dominance];

  let torax: number;
  let cintura: number;
  let quadril: number;
  let coxa: number;
  let ombro: number;
  let braco: number;
  let gancho: number;

  if (g === "m") {
    // Base estimates
    torax   = (altura * 0.53) + (peso * 0.11) + dom.torax;
    cintura = (altura * 0.42) + (peso * 0.18) + dom.cintura;
    quadril = (altura * 0.50) + (peso * 0.12) + dom.quadril;
    coxa    = quadril * 0.58 + dom.coxa;
    ombro   = torax * 0.46;
    braco   = torax * 0.36;
    gancho  = quadril * 0.30;

    // Apply user adjustments
    const toraxDelta = applyAdj(0, adj.toraxAdj, 4, 4);
    torax   += toraxDelta;
    ombro   += adj.toraxAdj * 2;
    braco   += adj.toraxAdj * 1.5;

    cintura += applyAdj(0, adj.cinturaAdj, 4, 4);

    const quadrilDelta = applyAdj(0, adj.quadrilAdj, 5, 4);
    quadril += quadrilDelta;
    gancho  += adj.quadrilAdj * 1;

    if (adj.gluteoAdj > 0) {
      quadril += adj.gluteoAdj * 2;
      gancho  += adj.gluteoAdj * 1;
    } else {
      quadril += adj.gluteoAdj * 2;
    }

    coxa += applyAdj(0, adj.coxaAdj, 4, 4);

  } else {
    // Base estimates
    torax   = (altura * 0.52) + (peso * 0.13) + dom.torax;
    cintura = (altura * 0.40) + (peso * 0.17) + dom.cintura;
    quadril = (altura * 0.54) + (peso * 0.15) + dom.quadril;
    coxa    = quadril * 0.60 + dom.coxa;
    ombro   = torax * 0.40;
    braco   = torax * 0.28;
    gancho  = quadril * 0.32;

    // Apply user adjustments
    const toraxDelta = applyAdj(0, adj.toraxAdj, 6, 5);
    torax += toraxDelta;
    braco += adj.toraxAdj * 1;

    cintura += applyAdj(0, adj.cinturaAdj, 5, 5);

    const quadrilDelta = applyAdj(0, adj.quadrilAdj, 7, 6);
    quadril += quadrilDelta;
    gancho  += adj.quadrilAdj * 2;

    if (adj.gluteoAdj > 0) {
      quadril += adj.gluteoAdj * 5;
      gancho  += adj.gluteoAdj * 3;
    } else {
      quadril += adj.gluteoAdj * 4;
    }

    coxa += applyAdj(0, adj.coxaAdj, 5, 5);
  }

  return {
    torax:   Math.max(60, Math.min(160, Math.round(torax * 10) / 10)),
    cintura: Math.max(50, Math.min(140, Math.round(cintura * 10) / 10)),
    quadril: Math.max(60, Math.min(160, Math.round(quadril * 10) / 10)),
    coxa:    Math.max(25, Math.min(100, Math.round(coxa * 10) / 10)),
    ombro:   Math.max(30, Math.min(80,  Math.round(ombro * 10) / 10)),
    braco:   Math.max(20, Math.min(60,  Math.round(braco * 10) / 10)),
    gancho:  Math.max(15, Math.min(60,  Math.round(gancho * 10) / 10)),
  };
}

// ─── FIT STATUS ───────────────────────────────────────────────────────────────

function easeToStatus(ease: number): FitStatus {
  if (ease < 0)       return 'apertado';
  if (ease < 3)       return 'levemente-justo';
  if (ease <= 14)     return 'ideal';
  if (ease <= 24)     return 'levemente-folgado';
  return 'folgado';
}

// ─── SIZE MATCHING ─────────────────────────────────────────────────────────────
// CRITICAL: iterate table in original order (= size order), NOT sorted by measurement.
// halfBodyWaist is rounded before adding ease to prevent floating-point boundary issues.

function matchChest(
  table: ChestRow[],
  bodyChest: number,
  availableSizes: string[],
  minEase: number
): { size: string | null; ease: number } {
  const rows = table.filter(r => availableSizes.includes(r.size));
  if (rows.length === 0) return { size: null, ease: 0 };

  const needed = Math.round(bodyChest) + minEase;

  const idx = rows.findIndex(r => r.chest >= needed);
  if (idx === -1) {
    const last = rows[rows.length - 1];
    return { size: last.size, ease: last.chest - bodyChest };
  }
  return { size: rows[idx].size, ease: rows[idx].chest - bodyChest };
}

function matchWaist(
  table: WaistRow[],
  halfBodyWaist: number,
  availableSizes: string[],
  minEase: number
): { size: string | null; ease: number } {
  const rows = table.filter(r => availableSizes.includes(r.size));
  if (rows.length === 0) return { size: null, ease: 0 };

  const needed = Math.round(halfBodyWaist) + minEase;

  const idx = rows.findIndex(r => r.halfWaist >= needed);
  if (idx === -1) {
    const last = rows[rows.length - 1];
    return { size: last.size, ease: (last.halfWaist - halfBodyWaist) * 2 };
  }
  return { size: rows[idx].size, ease: (rows[idx].halfWaist - halfBodyWaist) * 2 };
}

// ─── GARMENT CATEGORY ─────────────────────────────────────────────────────────

/** Returns 'upper' for tops/jackets and 'lower' for pants/skirts. */
export function getGarmentCategory(productName: string): 'upper' | 'lower' {
  const n = productName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (
    n.includes('calca') || n.includes('bermuda') ||
    n.includes('short') || n.includes('shorts') ||
    n.includes('saia')
  ) return 'lower';
  return 'upper';
}

// Generic letter-size fallback (used when product type is unrecognized)
function genericLetterSize(
  body: BodyMeasurements,
  gender: "m" | "f" | null,
  availableSizes: string[]
): string {
  const order = ["PPP", "PP", "P", "M", "G", "GG", "EXG", "EXGG"];
  const torax = body.torax;
  const g = gender ?? "m";

  let target: string;
  if (g === "m") {
    if (torax < 90)       target = "PP";
    else if (torax < 98)  target = "P";
    else if (torax < 107) target = "M";
    else if (torax < 115) target = "G";
    else if (torax < 125) target = "GG";
    else                  target = "EXGG";
  } else {
    if (torax < 83)       target = "PP";
    else if (torax < 90)  target = "P";
    else if (torax < 98)  target = "M";
    else if (torax < 106) target = "G";
    else if (torax < 115) target = "GG";
    else                  target = "EXGG";
  }

  if (availableSizes.includes(target)) return target;
  const idx = order.indexOf(target);
  for (let d = 1; d < order.length; d++) {
    if (idx + d < order.length && availableSizes.includes(order[idx + d])) return order[idx + d];
    if (idx - d >= 0           && availableSizes.includes(order[idx - d])) return order[idx - d];
  }
  return availableSizes[0];
}

// ─── PUBLIC API ────────────────────────────────────────────────────────────────

export function recommendSize(
  productName: string,
  gender: "m" | "f" | null,
  altura: number,
  peso: number,
  availableSizes: string[],
  adjustments: BodyAdjustments = DEFAULT_ADJUSTMENTS,
  dominance: BodyDominance = 'equilibrado',
): SizeRecommendation {
  if (availableSizes.length === 0) {
    return { primary: "M", bodyMeasurement: null };
  }

  const type = detectProductType(productName, gender, availableSizes);
  const body = estimateBody(altura, peso, gender, adjustments, dominance);
  const ease = MIN_EASE[type] ?? 0;

  const chestLabel = gender === "f" ? "Busto estimado" : "Tórax estimado";
  let match: { size: string | null; ease: number } = { size: null, ease: 0 };
  let bodyMeasurement: string | null = null;
  let fits: RegionFit[] | undefined;

  if (type === "agasalho") {
    match = matchChest(AGASALHO, body.torax, availableSizes, ease);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.torax)} cm`;
    fits = [
      { label: chestLabel.split(" ")[0], status: easeToStatus(match.ease), ease: match.ease },
    ];

  } else if (type === "agasalho-tectel") {
    match = matchChest(AGASALHO_TECTEL, body.torax, availableSizes, ease);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.torax)} cm`;
    fits = [
      { label: chestLabel.split(" ")[0], status: easeToStatus(match.ease), ease: match.ease },
    ];

  } else if (type === "camisete-f") {
    match = matchChest(CAMISETE_F, body.torax, availableSizes, ease);
    bodyMeasurement = `Busto estimado: ~${Math.round(body.torax)} cm`;
    fits = [
      { label: "Busto", status: easeToStatus(match.ease), ease: match.ease },
    ];

  } else if (type === "camisa-m") {
    match = matchChest(CAMISA_M, body.torax, availableSizes, ease);
    bodyMeasurement = `Tórax estimado: ~${Math.round(body.torax)} cm`;
    fits = [
      { label: "Tórax", status: easeToStatus(match.ease), ease: match.ease },
    ];

  } else if (type === "camisa-bege") {
    match = matchChest(CAMISA_BEGE, body.torax, availableSizes, ease);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.torax)} cm`;
    fits = [
      { label: chestLabel.split(" ")[0], status: easeToStatus(match.ease), ease: match.ease },
    ];

  } else if (type === "camiseta") {
    match = matchChest(CAMISETA_U, body.torax, availableSizes, ease);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.torax)} cm`;
    fits = [
      { label: chestLabel.split(" ")[0], status: easeToStatus(match.ease), ease: match.ease },
    ];

  } else if (type === "saia") {
    match = matchWaist(SAIA, body.cintura / 2, availableSizes, ease);
    bodyMeasurement = `Cintura estimada: ~${Math.round(body.cintura)} cm`;
    fits = [
      { label: "Cintura", status: easeToStatus(match.ease), ease: match.ease },
    ];

  } else if (type === "calca-tectel") {
    // Elastic waist — large garment ease by design; match by cintura
    match = matchWaist(CALCA_TECTEL, body.cintura / 2, availableSizes, ease);
    bodyMeasurement = `Cintura estimada: ~${Math.round(body.cintura)} cm`;
    const quadrilEase = body.quadril > 0 ? match.ease - (body.quadril - body.cintura) : match.ease;
    fits = [
      { label: "Cintura", status: easeToStatus(match.ease), ease: match.ease },
      { label: "Quadril", status: easeToStatus(quadrilEase), ease: quadrilEase },
    ];

  } else if (type === "calca") {
    // Military dress pants — match by cintura halfWaist
    match = matchWaist(CALCA, body.cintura / 2, availableSizes, ease);
    bodyMeasurement = `Cintura estimada: ~${Math.round(body.cintura)} cm`;
    // Quadril fit approximation (garment hip ≈ size×2 + delta)
    const garmentHip = match.ease / 1 + body.cintura; // approximate
    const quadrilEase = garmentHip - body.quadril;
    fits = [
      { label: "Cintura", status: easeToStatus(match.ease), ease: match.ease },
      { label: "Quadril", status: easeToStatus(quadrilEase), ease: quadrilEase },
    ];

  } else if (type === "tunica-f") {
    match = matchChest(TUNICA_F, body.torax, availableSizes, ease);
    bodyMeasurement = `Busto estimado: ~${Math.round(body.torax)} cm`;
    fits = [
      { label: "Busto", status: easeToStatus(match.ease), ease: match.ease },
    ];

  } else if (type === "tunica-m") {
    match = matchChest(TUNICA_M, body.torax, availableSizes, ease);
    bodyMeasurement = `Tórax estimado: ~${Math.round(body.torax)} cm`;
    fits = [
      { label: "Tórax", status: easeToStatus(match.ease), ease: match.ease },
    ];
  }

  // Generic fallback
  let primary = match.size;
  if (!primary) {
    primary = genericLetterSize(body, gender, availableSizes);
    bodyMeasurement = `${chestLabel}: ~${Math.round(body.torax)} cm`;
  }

  return { primary: primary!, bodyMeasurement, fits };
}
