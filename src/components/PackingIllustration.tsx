import { type PackingLayout, type PlacedBlock, type ShoeSvgKey } from "@/lib/packingLayout";

// SVG imports — ziplocks
import svgZipP from "@/assets/packing/ziplock_p_18x25.svg";
import svgZipM from "@/assets/packing/ziplock_m_25x35.svg";
import svgZipG from "@/assets/packing/ziplock_g_30x40.svg";

// SVG imports — caixas de sapato
import svgOly from "@/assets/packing/caixa_oly_36x21_5.svg";
import svgRdl from "@/assets/packing/caixa_rdl_39x18_5.svg";
import svgCp  from "@/assets/packing/caixa_cp_36x21_5.svg";
import svgBw  from "@/assets/packing/caixa_bw_33_5x30.svg";
import svgLyd from "@/assets/packing/caixa_lyd_33_5x22_5.svg";
import svgMd  from "@/assets/packing/caixa_md_30x16_5.svg";
import svgSd  from "@/assets/packing/caixa_sd_36x21_5.svg";

const SHOE_SVG: Record<ShoeSvgKey, string> = {
  oly: svgOly, rdl: svgRdl, cp: svgCp,
  bw: svgBw,   lyd: svgLyd, md: svgMd, sd: svgSd,
};

function blockSvg(block: PlacedBlock): string {
  if (block.kind === "ziplock_p") return svgZipP;
  if (block.kind === "ziplock_m") return svgZipM;
  if (block.kind === "ziplock_g") return svgZipG;
  return SHOE_SVG[block.svgKey ?? "oly"];
}

const FRAME_W = 300; // max display width in px

interface LayerFrameProps {
  layerIndex: number;
  blocks: PlacedBlock[];
  envelopeW: number; // cm
  envelopeL: number; // cm
}

function LayerFrame({ layerIndex, blocks, envelopeW, envelopeL }: LayerFrameProps) {
  const scale = FRAME_W / envelopeW;          // px per cm
  const frameH = envelopeL * scale;
  const PAD = 0;

  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        Camada {layerIndex + 1}{layerIndex === 0 ? " (base)" : ""}
      </p>
      <div
        style={{
          position: "relative",
          width: FRAME_W + PAD * 2,
          height: frameH + PAD * 2,
          border: "1.5px dashed #9CA3AF",
          borderRadius: 6,
          backgroundColor: "#F9FAFB",
          overflow: "hidden",
        }}
      >
        {blocks.map((b, i) => {
          const left = PAD + b.x * scale;
          const top  = PAD + b.y * scale;
          const w    = b.w * scale;
          const h    = b.l * scale;

          return (
            <img
              key={i}
              src={blockSvg(b)}
              alt={b.label.replace("\n", " ")}
              style={{
                position: "absolute",
                left,
                top,
                width: w,
                height: h,
                objectFit: "fill",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  layout: PackingLayout;
  orderId?: string;
}

export default function PackingIllustration({ layout, orderId }: Props) {
  const { dims, weightKg, blocks, envelopeLabel, envelopeColor } = layout;

  // Agrupar blocos por nível z — cada z único vira uma camada
  const zLevels = [...new Set(blocks.map(b => b.z))].sort((a, b) => a - b);
  const layers  = zLevels.map(z => blocks.filter(b => b.z === z));

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 flex-wrap">
        {orderId && (
          <span className="text-sm text-gray-500 font-mono">Pedido #{orderId.slice(0, 8)}</span>
        )}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${envelopeColor}`}>
          {envelopeLabel}
        </span>
        <span className="text-xs text-gray-500">
          {dims.w} × {dims.l} × {dims.h} cm
        </span>
        <span className="text-xs text-gray-500">
          {weightKg.toFixed(2).replace(".", ",")} kg
        </span>
      </div>

      {/* Uma camada por quadro */}
      {layers.map((layerBlocks, i) => (
        <LayerFrame
          key={i}
          layerIndex={i}
          blocks={layerBlocks}
          envelopeW={dims.w}
          envelopeL={dims.l}
        />
      ))}
    </div>
  );
}
