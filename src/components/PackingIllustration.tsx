import React from "react";
import { type PackingLayout, type BlockKind } from "@/lib/packingLayout";

const PAD = 18; // svg padding in px
const PX = 6;   // pixels per cm

const KIND_STYLE: Record<BlockKind, { fill: string; stroke: string; text: string }> = {
  ziplock_p: { fill: "#FFFDE7", stroke: "#F9A825", text: "#7B5B00" },
  ziplock_m: { fill: "#FFF9C4", stroke: "#FBC02D", text: "#6B4F00" },
  ziplock_g: { fill: "#FFF176", stroke: "#F57F17", text: "#5D3A00" },
  shoe_box:  { fill: "#E3F2FD", stroke: "#1565C0", text: "#0D47A1" },
};

const KIND_NAME: Record<BlockKind, string> = {
  ziplock_p: "ZIP P",
  ziplock_m: "ZIP M",
  ziplock_g: "ZIP G",
  shoe_box:  "Caixa",
};

interface Props {
  layout: PackingLayout;
  orderId?: string;
}

export default function PackingIllustration({ layout, orderId }: Props) {
  const { dims, blocks, envelopeLabel, envelopeColor } = layout;

  const svgW = dims.w * PX + 2 * PAD;
  const svgH = dims.l * PX + 2 * PAD;

  const sortedBlocks = [...blocks].sort((a, b) => a.z - b.z);
  const hasLayers = blocks.some(b => b.z > 0);

  // Which kinds are present
  const presentKinds = [...new Set(blocks.map(b => b.kind))] as BlockKind[];

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center gap-3 flex-wrap">
        {orderId && (
          <span className="text-sm text-gray-500 font-mono">
            Pedido #{orderId.slice(0, 8)}
          </span>
        )}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${envelopeColor}`}>
          {envelopeLabel}
        </span>
        <span className="text-xs text-gray-500">
          {dims.w} × {dims.l} × {dims.h} cm
        </span>
      </div>

      {/* Top-down SVG view */}
      <div className="overflow-x-auto">
        <svg
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ maxWidth: "100%", display: "block" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Envelope outline */}
          <rect
            x={PAD}
            y={PAD}
            width={dims.w * PX}
            height={dims.l * PX}
            fill="#F9FAFB"
            stroke="#9CA3AF"
            strokeWidth={1.5}
            strokeDasharray="7 3"
            rx={4}
          />

          {/* Dimension labels */}
          <text
            x={PAD + dims.w * PX / 2}
            y={PAD - 5}
            textAnchor="middle"
            fontSize={8}
            fontFamily="system-ui, sans-serif"
            fill="#9CA3AF"
          >
            {dims.w} cm
          </text>
          <text
            x={PAD - 4}
            y={PAD + dims.l * PX / 2}
            textAnchor="middle"
            fontSize={8}
            fontFamily="system-ui, sans-serif"
            fill="#9CA3AF"
            transform={`rotate(-90, ${PAD - 4}, ${PAD + dims.l * PX / 2})`}
          >
            {dims.l} cm
          </text>

          {/* Blocks — render lower z first so upper ones draw on top */}
          {sortedBlocks.map((b, i) => {
            const style = KIND_STYLE[b.kind];
            const isStacked = b.z > 0;
            const inset = isStacked ? 4 : 0;

            const rx = PAD + b.x * PX + inset;
            const ry = PAD + b.y * PX + inset;
            const rw = b.w * PX - inset * 2;
            const rh = b.l * PX - inset * 2;

            const cx = rx + rw / 2;
            const cy = ry + rh / 2;

            const lines = b.label.split("\n");

            return (
              <g key={i}>
                <rect
                  x={rx}
                  y={ry}
                  width={rw}
                  height={rh}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={isStacked ? 1 : 1.5}
                  strokeDasharray={isStacked ? "4 2" : undefined}
                  rx={3}
                />

                {/* Block label — centered, two lines if needed */}
                {lines.length === 1 ? (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9}
                    fontWeight="700"
                    fontFamily="system-ui, sans-serif"
                    fill={style.text}
                  >
                    {lines[0]}
                  </text>
                ) : (
                  <>
                    <text
                      x={cx}
                      y={cy - 6}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={9}
                      fontWeight="700"
                      fontFamily="system-ui, sans-serif"
                      fill={style.text}
                    >
                      {lines[0]}
                    </text>
                    <text
                      x={cx}
                      y={cy + 6}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={8}
                      fontFamily="system-ui, sans-serif"
                      fill={style.text}
                    >
                      {lines[1]}
                    </text>
                  </>
                )}

                {/* Z-level indicator for stacked blocks */}
                {isStacked && (
                  <text
                    x={rx + 3}
                    y={ry + 9}
                    fontSize={7}
                    fontFamily="system-ui, sans-serif"
                    fill={style.stroke}
                  >
                    +{Math.round(b.z)}cm↑
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {presentKinds.map(kind => {
          const style = KIND_STYLE[kind];
          return (
            <div key={kind} className="flex items-center gap-1.5">
              <div
                className="w-3.5 h-3.5 rounded border"
                style={{ background: style.fill, borderColor: style.stroke, borderWidth: 1.5 }}
              />
              <span className="text-gray-600">{KIND_NAME[kind]}</span>
            </div>
          );
        })}
        {hasLayers && (
          <div className="flex items-center gap-1.5 text-gray-500">
            <span
              className="w-3.5 h-3.5 rounded border border-dashed border-gray-400"
              style={{ display: "inline-block" }}
            />
            <span>camada superior</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed">
        Vista de cima (W × L). Itens tracejados ficam empilhados sobre outros.
      </p>
    </div>
  );
}
