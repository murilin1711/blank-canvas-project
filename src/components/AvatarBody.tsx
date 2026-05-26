import { useMemo } from "react";
import { computeVolume, type BodyDominance, type RegionVolume } from "@/lib/volumetry";

interface AvatarBodyProps {
  altura: number;
  peso: number;
  sex: "m" | "f";
  dominance?: BodyDominance;
}

const LEVEL_BG: Record<number, string> = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-cyan-100 text-cyan-700",
  3: "bg-green-100 text-green-700",
  4: "bg-amber-100 text-amber-700",
  5: "bg-red-100 text-red-700",
};

function LevelDots({ level }: { level: number }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${LEVEL_BG[level]}`}>
      {"●".repeat(level)}{"○".repeat(5 - level)}
    </span>
  );
}

function RegionRow({ label, region }: { label: string; region: RegionVolume }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-gray-500 w-14 shrink-0">{label}</span>
      <LevelDots level={region.level} />
    </div>
  );
}

export function AvatarBody({ altura, peso, sex, dominance = "equilibrado" }: AvatarBodyProps) {
  const vol = useMemo(
    () => computeVolume(altura, peso, sex, dominance),
    [altura, peso, sex, dominance]
  );

  const toraxOmbroSvg = sex === "f" ? "/avatars/torax-ombro-fem.svg" : "/avatars/torax-ombro-masc.svg";
  const inferioresSvg = sex === "f" ? "/avatars/inferiores-fem.svg" : "/avatars/inferiores-masc.svg";

  // Scale factors — average tórax+ombro for the upper SVG, quadril+coxa for the lower
  const upperScale = (vol.torax.scaleFactor + vol.ombro.scaleFactor) / 2;
  const lowerScale = (vol.quadril.scaleFactor + vol.coxa.scaleFactor) / 2;

  return (
    <div className="flex gap-3 items-stretch">
      {/* Silhueta composta */}
      <div className="flex flex-col items-center w-[72px] shrink-0 gap-0">
        {/* Tórax + Ombro */}
        <div className="w-full overflow-hidden" style={{ height: 90 }}>
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
              filter: "invert(13%) sepia(14%) saturate(696%) hue-rotate(314deg) brightness(91%) contrast(90%)",
            }}
          />
        </div>

        {/* Inferiores */}
        <div className="w-full overflow-hidden" style={{ height: 90 }}>
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
              filter: "invert(13%) sepia(14%) saturate(696%) hue-rotate(314deg) brightness(91%) contrast(90%)",
            }}
          />
        </div>
      </div>

      {/* Níveis por região */}
      <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
        <RegionRow label="Ombro" region={vol.ombro} />
        {sex === "f" && vol.busto ? (
          <RegionRow label="Busto" region={vol.busto} />
        ) : (
          <RegionRow label="Tórax" region={vol.torax} />
        )}
        <RegionRow label="Abdome" region={vol.abdome} />
        <RegionRow label="Quadril" region={vol.quadril} />
        <RegionRow label="Coxa" region={vol.coxa} />
        <RegionRow label="Glúteo" region={vol.gluteo} />
      </div>
    </div>
  );
}
