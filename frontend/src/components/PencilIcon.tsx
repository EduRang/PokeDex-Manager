import type { SVGProps } from "react";

// Lápiz en pixel art de 10×10, con la punta abajo a la izquierda
// K = contorno, A = cuerpo, W = madera, G = mina, . = transparente
const PIXELS = [
  ".......KK.",
  "......KAAK",
  ".....KAAAK",
  "....KAAAK.",
  "...KAAAK..",
  "..KAAAK...",
  ".KWAAK....",
  ".KWWK.....",
  "KGKK......",
  "KK........",
];

const COLORS: Record<string, string> = {
  K: "var(--color-dex-frame-dark)",
  A: "var(--color-dex-accent)",
  W: "#f2d3a0",
  G: "var(--color-dex-frame-dark)",
};

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 10 10" shapeRendering="crispEdges" {...props}>
      {PIXELS.flatMap((row, y) =>
        [...row].map((pixel, x) =>
          pixel === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={COLORS[pixel]}
            />
          ),
        ),
      )}
    </svg>
  );
}
