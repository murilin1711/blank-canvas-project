import { useMemo } from "react";
import { motion } from "framer-motion";

export interface BodyFigureScales {
  toraxSx:   number;
  abdomeSx:  number;
  quadrilSx: number;
  coxaSx:    number;
  gluteoSx:  number;
  sex:       "m" | "f";
}

type Pt = [number, number];
const r = (n: number) => n.toFixed(1);

// Catmull-Rom → Cubic Bézier
function spline(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M ${r(pts[0][0])} ${r(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${r(c1x)} ${r(c1y)},${r(c2x)} ${r(c2y)},${r(p2[0])} ${r(p2[1])}`;
  }
  return d;
}

// ─── REGRA DE GEOMETRIA ───────────────────────────────────────────────────────
// ViewBox 200 × 430  |  centro cx = 100
//
// Para o braço ficar FORA do tronco (gap visível):
//   arm_inner (aiW) deve ser MENOR que chest (chW)
//   → gap = aiW - chW   deve ser POSITIVO
//   aiW = aoW - armWidth   →   chW < aoW - armWidth
//
// Ex. masculino normal (toraxSx=1):
//   aoW=50, armWidth=12, aiW=38, chW=34  →  gap=4px ✓

function buildPath(s: BodyFigureScales): string {
  const { toraxSx, abdomeSx, quadrilSx, coxaSx, sex } = s;
  const isFem = sex === "f";
  const cx = 100;

  // ── Parâmetros base (px) ──────────────────────────────────────────────────
  // gap = (aoW - armW) - chW  deve ser ≥ 10px para braço claramente separado
  // Ex masculino: aoW=58, armW=12, aiW=46, chW=34 → gap=12px ✓
  const aoW  = (isFem ? 52 : 58) * toraxSx;   // ombros
  const armW = isFem ? 10 : 12;                // largura do braço (FIXO)
  const aiW  = aoW - armW;                     // arm inner
  const chW  = (isFem ? 30 : 34) * toraxSx;   // tórax → gap=12px
  const wsW  = (isFem ? 26 : 30) * abdomeSx;  // cintura
  const abW  = (isFem ? 30 : 35) * abdomeSx;  // abdome
  // hpW DEVE ser ≈ lcx + thW para não criar "bunda enorme"
  // Ex: lcx=20, thW=18 → outer thigh = 38 → hpW ≈ 38-40
  const hpW  = (isFem ? 44 : 38) * Math.max(quadrilSx, s.gluteoSx);
  const nkW  = 13;

  const lcx  = isFem ? 18 : 20;
  const thW  = (isFem ? 20 : 18) * coxaSx;    // reduzido para alinhar com hip
  const knW  = (isFem ? 14 : 13) * coxaSx;
  const cfW  = (isFem ? 13 : 12) * coxaSx;
  const akW  = 9;
  const ftW  = isFem ? 22 : 26;

  // ── Posições Y ────────────────────────────────────────────────────────────
  const Y = {
    // Pescoço: inicia em nT (dentro da oval da cabeça, para conexão visual)
    // Cabeça: cy=32, ry=29 → fundo=61. Em y=55: largura≈13px ≈ nkW. Encaixa!
    nT:  55,   // pescoço topo (dentro da cabeça → sem gap visível)
    nB:  70,   // pescoço base
    sh:  82,   // ombro pico
    aM: 158,   // meio do braço (ponto extra para curva natural)
    aB: 228,   // braço fundo / punho
    hBo:242,   // mão fundo
    ax: 102,   // axila (arm inner → tronco)
    ch: 116,   // peito
    ws: 158,   // cintura
    ab: 178,   // abdome
    hT: 192,   // quadril topo
    hp: 210,   // quadril pico
    cr: 226,   // virilha
    tT: 236,   // coxa topo
    kn: 300,   // joelho
    cT: 314,   // panturrilha topo
    cM: 352,   // panturrilha pico
    ak: 390,   // tornozelo
    hl: 400,   // calcanhar
    to: 412,   // bico do pé
  };

  const lx = cx - lcx;
  const rx = cx + lcx;

  // ── PATH ÚNICO — fixes:
  // 1. Pescoço começa dentro da cabeça (Y.nT=55, sem Z → sem linha horizontal)
  // 2. Ombro: sem ponto duplo no mesmo X (nó eliminado)
  // 3. Braço: ponto de meio (Y.aM) → curva natural suave
  // 4. Axila: ponto de curva côncava natural

  const pts: Pt[] = [

    // Pescoço esquerdo (inicia dentro da oval da cabeça)
    [cx - nkW, Y.nT],
    [cx - nkW, Y.nB],

    // Ombro esquerdo — transição suave pescoço→ombro→braço (SEM ponto duplo)
    [cx - aoW, Y.sh],            // ombro peak = topo externo do braço
    // Braço esquerdo outer (descendo com curva leve natural)
    [cx - aoW - 1, Y.aM],       // leve bow outward no meio do braço
    [cx - aoW + 2, Y.aB],       // punho (leve afinamento)
    // Mão esquerda
    [cx - aoW + 4, Y.hBo],      // canto externo
    [cx - aoW + armW / 2, Y.hBo + 7], // centro fundo arredondado
    [cx - aiW - 2, Y.hBo],      // canto interno
    // Braço esquerdo inner (subindo)
    [cx - aiW + 1, Y.aB],       // punho inner
    [cx - aiW + 2, Y.aM],       // meio inner (paralelo ao outer)
    [cx - aiW, Y.ax],            // axila
    // Axila → tronco: curva côncava natural (ELIMINADO o "nó" antigo)
    [cx - chW + 2, Y.ax + 8],   // ponto côncavo da axila
    [cx - chW, Y.ch],            // peito

    // Tronco esquerdo (descendo)
    [cx - chW, Y.ch],
    [cx - wsW, Y.ws],
    [cx - abW, Y.ab],
    [cx - hpW, Y.hT],
    [cx - hpW, Y.hp],
    // Curva suave hip→coxa (sem inflexão brusca)
    [lx - thW, Y.cr],
    [lx - thW, Y.tT],
    [lx - knW, Y.kn],
    [lx - cfW, Y.cT],
    [lx - cfW - 1, Y.cM],
    [lx - akW, Y.ak],
    [lx - akW - 1, Y.hl],
    [lx - ftW / 2, Y.to],        // bico esquerdo

    // Pé esquerdo (cruza da ponta para o calcanhar)
    [lx + ftW / 2, Y.to],
    [lx + akW + 1, Y.hl],
    [lx + akW, Y.ak],

    // Perna esquerda (inner — subindo)
    [lx + cfW, Y.cM],
    [lx + cfW - 1, Y.cT],
    [lx + knW, Y.kn],
    [lx + thW, Y.tT],
    [lx + thW, Y.cr],

    // Virilha (V entre as pernas)
    [cx, Y.cr + 10],

    // Perna direita (inner — descendo)
    [rx - thW, Y.cr],
    [rx - thW, Y.tT],
    [rx - knW, Y.kn],
    [rx - cfW - 1, Y.cT],
    [rx - cfW - 1, Y.cM],
    [rx - akW, Y.ak],
    [rx - akW - 1, Y.hl],
    [rx - ftW / 2, Y.to],

    // Pé direito
    [rx + ftW / 2, Y.to],
    [rx + akW + 1, Y.hl],
    [rx + akW, Y.ak],

    // Perna direita (outer — subindo)
    [rx + cfW, Y.cM],
    [rx + cfW, Y.cT],
    [rx + knW, Y.kn],
    [rx + thW, Y.tT],
    [rx + thW, Y.cr],

    // Tronco direito (subindo) — curva suave coxa→hip→quadril
    [cx + hpW, Y.hp],
    [cx + hpW, Y.hT],
    [cx + abW, Y.ab],
    [cx + wsW, Y.ws],
    [cx + chW, Y.ch],
    // Axila direita → braço inner (curva côncava espelho)
    [cx + chW - 2, Y.ax + 8],
    [cx + aiW, Y.ax],

    // Braço direito inner (descendo até mão) — espelho esquerdo
    [cx + aiW - 2, Y.aM],
    [cx + aiW - 1, Y.aB],
    [cx + aiW + 2, Y.hBo],           // canto interno
    [cx + aoW - armW / 2, Y.hBo + 7],// centro fundo arredondado
    [cx + aoW - 4, Y.hBo],           // canto externo
    // Braço direito outer (subindo)
    [cx + aoW - 2, Y.aB],
    [cx + aoW + 1, Y.aM],            // bow outward
    // Ombro direito → pescoço (SEM ponto duplo)
    [cx + aoW, Y.sh],
    [cx + nkW, Y.nB],
    [cx + nkW, Y.nT],
  ];

  // Sem Z: evita linha horizontal visível dentro da cabeça no topo do pescoço
  return spline(pts);
}

// ─── Cabeça oval — cy e ry calibrados para base encaixar no pescoço ──────────
// cy=32, ry=29 → fundo em y=61. Em y=55 (Y.nT): largura ≈ nkW=13px ✓
function makeHeadD(sex: "m" | "f"): string {
  const cx = 100, cy = 32;
  const rx = sex === "f" ? 18 : 21;
  const ry = sex === "f" ? 27 : 29;
  return (
    `M ${cx - rx} ${cy} ` +
    `A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} ` +
    `A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`
  );
}

// ─── Highlight de região ──────────────────────────────────────────────────────
const BANDS: Record<string, [number, number]> = {
  torax:   [68, 158],
  abdome:  [152, 227],
  quadril: [185, 238],
  gluteo:  [185, 238],
  coxa:    [232, 412],
};

// ─── Componente ───────────────────────────────────────────────────────────────
interface Props extends BodyFigureScales {
  width?: number;
  height?: number;
  activeRegion?: keyof typeof BANDS | null;
}

export function BodyFigureSVG({
  toraxSx, abdomeSx, quadrilSx, coxaSx, gluteoSx, sex,
  width = 160, height = 344,
  activeRegion,
}: Props) {
  const bodyD = useMemo(
    () => buildPath({ toraxSx, abdomeSx, quadrilSx, coxaSx, gluteoSx, sex }),
    [toraxSx, abdomeSx, quadrilSx, coxaSx, gluteoSx, sex]
  );
  const headD = useMemo(() => makeHeadD(sex), [sex]);
  const band  = activeRegion ? BANDS[activeRegion] : null;

  const stroke = "#2A2826";
  const sw     = 2.2;
  const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

  return (
    <svg viewBox="0 0 200 430" xmlns="http://www.w3.org/2000/svg"
      style={{ width, height, display: "block" }}>

      {band && (
        <rect x={8} y={band[0]} width={184} height={band[1] - band[0]}
          fill="#2e3091" opacity={0.06} rx={10} />
      )}

      <motion.path d={headD} fill="white" stroke={stroke} strokeWidth={sw}
        animate={{ d: headD }} transition={spring} />

      <motion.path d={bodyD} fill="white" stroke={stroke} strokeWidth={sw}
        strokeLinejoin="round" strokeLinecap="round"
        animate={{ d: bodyD }} transition={spring} />
    </svg>
  );
}
