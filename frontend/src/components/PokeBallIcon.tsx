import type { SVGProps } from "react";

// Poké Ball en pixel art de 12×12
// K = contorno, R = rojo, W = blanco, . = transparente
const PIXELS = [
  "....KKKK....",
  "..KKRRRRKK..",
  ".KRRWRRRRRK.",
  ".KRWRRRRRRK.",
  "KRRRRKKRRRRK",
  "KKKKKWWKKKKK",
  "KKKKKWWKKKKK",
  "KWWWWKKWWWWK",
  ".KWWWWWWWWK.",
  ".KWWWWWWWWK.",
  "..KKWWWWKK..",
  "....KKKK....",
];

const COLORS: Record<string, string> = {
  K: "var(--color-dex-frame-dark)",
  R: "var(--color-dex-accent)",
  W: "#fff",
};

export function PokeBallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 12 12" shapeRendering="crispEdges" {...props}>
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
