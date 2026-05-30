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

import toraxOmbroMascRaw from "@/assets/avatars/torax-ombro-masc.svg?raw";
import toraxOmbroFemRaw  from "@/assets/avatars/torax-ombro-fem.svg?raw";
import abdomeMascRaw     from "@/assets/avatars/abdome-masc.svg?raw";
import bustoAbdomeFemRaw from "@/assets/avatars/busto-abdome-fem.svg?raw";
import inferioresMascRaw from "@/assets/avatars/inferiores-masc.svg?raw";
import inferioresFemRaw  from "@/assets/avatars/inferiores-fem.svg?raw";
import gluteoRaw         from "@/assets/avatars/gluteo.svg?raw";

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

// Extrai o conteúdo interno de um grupo SVG pelo id
function extractGroupContent(svgRaw: string, groupId: string): string {
  const open = `id="${groupId}"`;
  const start = svgRaw.indexOf(open);
  if (start === -1) return "";
  const tagEnd = svgRaw.indexOf(">", start) + 1;
  let depth = 1;
  let i = tagEnd;
  while (i < svgRaw.length && depth > 0) {
    const nextOpen  = svgRaw.indexOf("<g",  i);
    const nextClose = svgRaw.indexOf("</g>", i);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 2;
    } else {
      depth--;
      if (depth === 0) return svgRaw.slice(tagEnd, nextClose);
      i = nextClose + 4;
    }
  }
  return "";
}

// Transform SVG de escala horizontal centrada em x=5000 (centro do viewBox 10000)
function scaleGroupTransform(scaleX: number): string {
  return `translate(5000,0) scale(${scaleX},1) translate(-5000,0)`;
}

interface AvatarSVGProps {
  sex: "m" | "f";
  toraxOmbroScale: number;
  abdomeScale: number;
  bustoScale: number;
  quadrilScale: number;
  coxaScale: number;
  gluteoScale: number;
}

function AvatarSVG({
  sex,
  toraxOmbroScale,
  abdomeScale,
  bustoScale,
  quadrilScale,
  coxaScale,
  gluteoScale,
}: AvatarSVGProps) {
  const svgContent = useMemo(() => {
    const toraxOmbroRaw = sex === "f" ? toraxOmbroFemRaw : toraxOmbroMascRaw;
    const toraxOmbroPaths = extractGroupContent(toraxOmbroRaw, "torax_ombro_editavel");

    const abdomeSource = sex === "f" ? bustoAbdomeFemRaw : abdomeMascRaw;
    const bustoPaths  = sex === "f" ? extractGroupContent(bustoAbdomeFemRaw, "busto_editavel") : "";
    const abdomePaths = extractGroupContent(abdomeSource, "abdome_editavel");

    const inferioresRaw = sex === "f" ? inferioresFemRaw : inferioresMascRaw;
    const quadrilPaths  = extractGroupContent(inferioresRaw, "quadril_editavel");
    const coxaPaths     = extractGroupContent(inferioresRaw, "coxa_editavel");

    const gluteoPaths = extractGroupContent(gluteoRaw, "gluteo_editavel");

    const bustoGroup = sex === "f"
      ? `<g id="busto_editavel" transform="${scaleGroupTransform(bustoScale)}">${bustoPaths}</g>`
      : "";

    return `
      <g transform="scale(1,-1) translate(0,-10000)">
        <g id="torax_ombro_editavel" transform="${scaleGroupTransform(toraxOmbroScale)}">
          ${toraxOmbroPaths}
        </g>
        ${bustoGroup}
        <g id="abdome_editavel" transform="${scaleGroupTransform(abdomeScale)}">
          ${abdomePaths}
        </g>
        <g id="quadril_editavel" transform="${scaleGroupTransform(quadrilScale)}">
          ${quadrilPaths}
        </g>
        <g id="coxa_editavel" transform="${scaleGroupTransform(coxaScale)}">
          ${coxaPaths}
        </g>
        <g id="gluteo_editavel" transform="${scaleGroupTransform(gluteoScale)}">
          ${gluteoPaths}
        </g>
      </g>
    `;
  }, [sex, toraxOmbroScale, abdomeScale, bustoScale, quadrilScale, coxaScale, gluteoScale]);

  return (
    <svg
      viewBox="0 0 10000 10000"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        filter:
          "invert(13%) sepia(14%) saturate(696%) hue-rotate(314deg) brightness(91%) contrast(90%)",
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
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

  return (
    <div className="flex gap-4 items-center">
      {/* Silhueta com escala independente por região */}
      <div className="w-[110px] shrink-0" style={{ aspectRatio: "1 / 1.8" }}>
        <AvatarSVG
          sex={sex}
          toraxOmbroScale={adj.torax.scaleFactor}
          abdomeScale={adj.abdome.scaleFactor}
          bustoScale={adj.busto?.scaleFactor ?? 1}
          quadrilScale={adj.quadril.scaleFactor}
          coxaScale={adj.coxa.scaleFactor}
          gluteoScale={adj.gluteo.scaleFactor}
        />
      </div>

      {/* Barras de nível por região */}
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
