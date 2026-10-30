import type { SVGProps } from "react";

// Super Ball en pixel art de 12×12: mitad superior azul con franjas rojas a los lados
// K = contorno, B = azul, R = rojo, W = blanco, . = transparente
const PIXELS = [
  "....KKKK....",
  "..KKBBBBKK..",
  ".KRRWBBBRRK.",
  ".KRWBBBBBRK.",
  "KRBBBKKBBBRK",
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
  B: "#3d7dca",
  R: "var(--color-dex-accent)",
  W: "#fff",
};

export function GreatBallIcon(props: SVGProps<SVGSVGElement>) {
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
