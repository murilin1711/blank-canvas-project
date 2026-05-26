/**
 * Motor Matemático de Volumetria — converte altura/peso/sexo/dominância
 * em níveis de deformação anatômica para os SVGs do avatar corporal.
 *
 * O sistema calcula VOLUME VISUAL CORPORAL (como o corpo aparenta vestir
 * roupas), não gordura. O nível "Normal" = SVG base = 0 cm de delta.
 *
 * Fonte: documentos "MOTOR MATEMÁTICO DE VOLUMETRIA" e
 *        "REGRAS DE EXPANSÃO VISUAL DOS AVATARES SVG".
 */

// ─── TIPOS PÚBLICOS ─────────────────────────────────────────────────────────

/** 1 = Pouco Volumoso … 5 = Volumoso */
export type VolumeLevel = 1 | 2 | 3 | 4 | 5;

export type BodyDominance = 'tronco' | 'inferior' | 'equilibrado';

export interface RegionVolume {
  level: VolumeLevel;
  name: string;
  deltaCm: number;      // cm a mais/menos em relação ao SVG Normal
  scaleFactor: number;  // fator de escala proporcional para deformação vetorial
  regionKey: string;    // chave interna para DEFORMATION e NORMAL_SVG_CM
}

export interface VolumetryResult {
  ombro:   RegionVolume;
  torax:   RegionVolume;
  abdome:  RegionVolume;
  busto?:  RegionVolume;   // apenas feminino
  quadril: RegionVolume;
  coxa:    RegionVolume;
  gluteo:  RegionVolume;
}

// ─── TABELA DE NOMES ─────────────────────────────────────────────────────────

export const LEVEL_NAMES: Record<VolumeLevel, string> = {
  1: 'Pouco Volumoso',
  2: 'Pequeno',
  3: 'Normal',
  4: 'Grande',
  5: 'Volumoso',
};

// ─── TABELA DE DEFORMAÇÃO (cm do SVG Normal) ─────────────────────────────────
// Fonte: documento "MOTOR MATEMÁTICO DE VOLUMETRIA — REGRA MATEMÁTICA REAL DE DEFORMAÇÃO"

export const DEFORMATION: Readonly<Record<string, Record<VolumeLevel, number>>> = {
  ombro:    { 1: -7,   2: -3.5, 3: 0, 4: 5,  5: 9  },
  torax:    { 1: -10,  2: -5,   3: 0, 4: 7,  5: 14 },
  abdome:   { 1: -11,  2: -5,   3: 0, 4: 9,  5: 18 },
  bustof:   { 1: -8,   2: -4,   3: 0, 4: 6,  5: 12 },
  quadrilf: { 1: -8,   2: -4,   3: 0, 4: 6,  5: 12 },
  quadrilm: { 1: -6,   2: -3,   3: 0, 4: 4,  5: 8  },
  coxaf:    { 1: -5,   2: -2.5, 3: 0, 4: 4,  5: 8  },
  coxam:    { 1: -4,   2: -2,   3: 0, 4: 3,  5: 6  },
  gluteo:   { 1: -6,   2: -3,   3: 0, 4: 5,  5: 10 },
};

// Circunferências de referência (cm) do SVG Normal — usadas para calcular
// o scaleFactor proporcional para deformação vetorial.
// Exemplo do documento: tórax normal = 100 cm → Grande = 107/100 = 1.07.
export const NORMAL_SVG_CM: Readonly<Record<string, number>> = {
  ombro:    44,
  torax:    100,
  abdome:   88,
  bustof:   92,
  quadrilf: 96,
  quadrilm: 92,
  coxaf:    56,
  coxam:    52,
  gluteo:   94,
};

// ─── DESLOCAMENTOS POR DOMINÂNCIA ─────────────────────────────────────────────
// Ajustes de nível a aplicar sobre o nível-base por tipo de dominância corporal.

interface DominanceShifts {
  ombro: number; torax: number; abdome: number;
  busto: number; quadril: number; coxa: number; gluteo: number;
}

const DOMINANCE_SHIFTS: Readonly<Record<BodyDominance, DominanceShifts>> = {
  tronco:      { ombro:  2, torax:  2, abdome:  0, busto:  2, quadril:  0, coxa: -1, gluteo:  0 },
  inferior:    { ombro: -2, torax: -1, abdome: -1, busto: -1, quadril:  1, coxa:  1, gluteo:  1 },
  equilibrado: { ombro:  0, torax:  0, abdome:  0, busto:  0, quadril:  0, coxa:  0, gluteo:  0 },
};

// ─── FUNÇÕES INTERNAS ─────────────────────────────────────────────────────────

function clampLevel(n: number): VolumeLevel {
  return Math.max(1, Math.min(5, Math.round(n))) as VolumeLevel;
}

function buildRegion(key: string, level: VolumeLevel): RegionVolume {
  const delta = DEFORMATION[key][level];
  const normalCm = NORMAL_SVG_CM[key];
  return {
    level,
    name: LEVEL_NAMES[level],
    deltaCm: delta,
    scaleFactor: Math.round(((normalCm + delta) / normalCm) * 1000) / 1000,
    regionKey: key,
  };
}

/**
 * Fator de altura visual — pessoas mais baixas aparentam mais volume no mesmo peso.
 * Retorna divisor: quanto maior, menos volume visual para a mesma densidade.
 */
function heightFactor(altura: number, sex: 'm' | 'f'): number {
  if (sex === 'f') {
    if (altura < 150) return 0.88;
    if (altura < 160) return 0.94;
    if (altura < 168) return 1.00;
    if (altura < 175) return 1.06;
    return 1.12;
  }
  if (altura < 162) return 0.88;
  if (altura < 170) return 0.94;
  if (altura < 178) return 1.00;
  if (altura < 186) return 1.06;
  return 1.12;
}

/**
 * Mapeia o BMI visual ajustado em nível-base (1-5).
 * Calibrado com os casos do documento: Vanessa 159/50, Maria 163/70, Antônio 180/83.
 */
function densityToBaseLevel(adjustedBmi: number): VolumeLevel {
  if (adjustedBmi < 18) return 1;
  if (adjustedBmi < 22) return 2;
  if (adjustedBmi < 26) return 3;
  if (adjustedBmi < 30) return 4;
  return 5;
}

// ─── API PÚBLICA ──────────────────────────────────────────────────────────────

/**
 * Calcula os níveis de volume visual por região corporal.
 *
 * @param altura  Altura em cm
 * @param peso    Peso em kg
 * @param sex     'f' | 'm'
 * @param dominance  Onde o corpo concentra volume ('tronco' | 'inferior' | 'equilibrado')
 *
 * @returns VolumetryResult com level, nome, deltaCm e scaleFactor por região.
 *          scaleFactor pode ser aplicado diretamente à largura do SVG na região.
 *
 * @example
 * // Antônio 180/83 kg, tronco dominante:
 * const v = computeVolume(180, 83, 'm', 'tronco');
 * // v.ombro.level === 5 (Volumoso), v.quadril.level === 3 (Normal)
 */
export function computeVolume(
  altura: number,
  peso: number,
  sex: 'm' | 'f',
  dominance: BodyDominance = 'equilibrado',
): VolumetryResult {
  const alturaM = altura / 100;
  const rawBmi = peso / (alturaM * alturaM);
  const adjusted = rawBmi / heightFactor(altura, sex);
  const base = densityToBaseLevel(adjusted);

  const shifts = DOMINANCE_SHIFTS[dominance];
  const quadrilKey = sex === 'f' ? 'quadrilf' : 'quadrilm';
  const coxaKey    = sex === 'f' ? 'coxaf'    : 'coxam';

  const result: VolumetryResult = {
    ombro:   buildRegion('ombro',   clampLevel(base + shifts.ombro)),
    torax:   buildRegion('torax',   clampLevel(base + shifts.torax)),
    abdome:  buildRegion('abdome',  clampLevel(base + shifts.abdome)),
    quadril: buildRegion(quadrilKey, clampLevel(base + shifts.quadril)),
    coxa:    buildRegion(coxaKey,   clampLevel(base + shifts.coxa)),
    gluteo:  buildRegion('gluteo',  clampLevel(base + shifts.gluteo)),
  };

  if (sex === 'f') {
    result.busto = buildRegion('bustof', clampLevel(base + shifts.busto));
  }

  return result;
}

/**
 * Retorna o resultado no formato JSON do documento:
 * { ombro: "volumoso", torax: "volumoso", ... }
 */
export function volumetryToJson(v: VolumetryResult): Record<string, string> {
  const key = (name: string) => name.toLowerCase().replace(/ /g, '_');
  const out: Record<string, string> = {
    ombro:   key(v.ombro.name),
    torax:   key(v.torax.name),
    abdome:  key(v.abdome.name),
    quadril: key(v.quadril.name),
    coxa:    key(v.coxa.name),
    gluteo:  key(v.gluteo.name),
  };
  if (v.busto) out.busto = key(v.busto.name);
  return out;
}
