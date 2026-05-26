import { useMemo } from "react";
import {
  computeVolume,
  type BodyDominance,
  type RegionVolume,
  type VolumeLevel,
  DEFORMATION,
  NORMAL_SVG_CM,
  LEVEL_NAMES,
} from "@/lib/volumetry";
import type { BodyAdjustments } from "@/lib/sizeFinder";

interface AvatarBodyProps {
  altura: number;
  peso: number;
  sex: "m" | "f";
  dominance?: BodyDominance;
  adjustments?: BodyAdjustments;
}

const LEVEL_COLOR: Record<number, { bar: string }> = {
  1: { bar: "bg-blue-400"  },
  2: { bar: "bg-cyan-400"  },
  3: { bar: "bg-green-400" },
  4: { bar: "bg-amber-400" },
  5: { bar: "bg-red-400"   },
};

function clampLevel(n: number): VolumeLevel {
  return Math.max(1, Math.min(5, Math.round(n))) as VolumeLevel;
}

function adjToShift(adj: number): number {
  if (adj >= 2) return 1;
  if (adj <= -2) return -1;
  return 0;
}

function shiftRegion(region: RegionVolume, shift: number): RegionVolume {
  if (shift === 0) return region;
  const newLevel = clampLevel(region.level + shift);
  if (newLevel === region.level) return region;
  const delta = DEFORMATION[region.regionKey][newLevel];
  const normalCm = NORMAL_SVG_CM[region.regionKey];
  return {
    ...region,
    level: newLevel,
    name: LEVEL_NAMES[newLevel],
    deltaCm: delta,
    scaleFactor: Math.round(((normalCm + delta) / normalCm) * 1000) / 1000,
  };
}

function RegionRow({ label, region }: { label: string; region: RegionVolume }) {
  const bar = LEVEL_COLOR[region.level].bar;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-12 shrink-0 text-right leading-tight">{label}</span>
      <div className="flex gap-0.5 flex-1">
        {([1, 2, 3, 4, 5] as const).map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${i <= region.level ? bar : "bg-gray-200"}`}
          />
        ))}
      </div>
    </div>
  );
}

export function AvatarBody({
  altura,
  peso,
  sex,
  dominance = "equilibrado",
  adjustments,
}: AvatarBodyProps) {
  const vol = useMemo(
    () => computeVolume(altura, peso, sex, dominance),
    [altura, peso, sex, dominance]
  );

  const adj = useMemo(() => {
    if (!adjustments) return vol;
    const toraxShift   = adjToShift(adjustments.toraxAdj);
    const cinturaShift = adjToShift(adjustments.cinturaAdj);
    const quadrilShift = adjToShift(adjustments.quadrilAdj);
    const gluteoShift  = adjToShift(adjustments.gluteoAdj);
    const coxaShift    = adjToShift(adjustments.coxaAdj);
    return {
      ombro:   vol.ombro,
      torax:   shiftRegion(vol.torax,   toraxShift),
      abdome:  shiftRegion(vol.abdome,  cinturaShift),
      quadril: shiftRegion(vol.quadril, quadrilShift),
      coxa:    shiftRegion(vol.coxa,    coxaShift),
      gluteo:  shiftRegion(vol.gluteo,  gluteoShift),
      busto:   vol.busto ? shiftRegion(vol.busto, toraxShift) : undefined,
    };
  }, [vol, adjustments]);

  const toraxOmbroSvg =
    sex === "f" ? "/avatars/torax-ombro-fem.svg" : "/avatars/torax-ombro-masc.svg";
  const inferioresSvg =
    sex === "f" ? "/avatars/inferiores-fem.svg" : "/avatars/inferiores-masc.svg";

  const upperScale = (adj.torax.scaleFactor + adj.ombro.scaleFactor) / 2;
  const lowerScale = (adj.quadril.scaleFactor + adj.coxa.scaleFactor) / 2;

  return (
    <div className="flex gap-4 items-center">
      {/* Silhueta — maior para tornar as mudanças de escala visíveis */}
      <div className="flex flex-col items-center w-[110px] shrink-0 gap-0">
        <div className="w-full overflow-hidden" style={{ height: 130 }}>
          <img
            src={toraxOmbroSvg}
            alt=""
            aria-hidden
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              transform: `scaleX(${upperScale})`,
              transformOrigin: "center top",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              filter:
                "invert(13%) sepia(14%) saturate(696%) hue-rotate(314deg) brightness(91%) contrast(90%)",
            }}
          />
        </div>
        <div className="w-full overflow-hidden" style={{ height: 140 }}>
          <img
            src={inferioresSvg}
            alt=""
            aria-hidden
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              transform: `scaleX(${lowerScale})`,
              transformOrigin: "center top",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              filter:
                "invert(13%) sepia(14%) saturate(696%) hue-rotate(314deg) brightness(91%) contrast(90%)",
            }}
          />
        </div>
      </div>

      {/* Níveis por região — barras de progresso */}
      <div className="flex flex-col justify-center gap-2.5 flex-1 min-w-0">
        <RegionRow label="Ombro" region={adj.ombro} />
        {sex === "f" && adj.busto ? (
          <RegionRow label="Busto" region={adj.busto} />
        ) : (
          <RegionRow label="Tórax" region={adj.torax} />
        )}
        <RegionRow label="Abdome" region={adj.abdome} />
        <RegionRow label="Quadril" region={adj.quadril} />
        <RegionRow label="Coxa" region={adj.coxa} />
        <RegionRow label="Glúteo" region={adj.gluteo} />
      </div>
    </div>
  );
}
