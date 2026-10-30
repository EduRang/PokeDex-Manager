import type { CSSProperties, ReactNode } from "react";

const STRIPED_NAVY =
  "bg-dex-frame bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0_10px,transparent_10px_20px)]";

interface InfoSheetProps {
  title: string;
  children: ReactNode;
}

export function InfoSheet({ title, children }: InfoSheetProps) {
  return (
    <div className="overflow-hidden rounded-md border-2 border-dex-frame-dark shadow-[0_4px_0_0_rgb(0_0_0/0.2)]">
      <p className="bg-dex-frame-dark px-3 py-2 font-bold text-white uppercase pixel-shadow-ink md:pl-6">
        {title}
      </p>
      {/* overflow-hidden recorta los bordes exteriores de los bloques inclinados,
          así el marco queda recto y solo el interior va en diagonal */}
      <div className="flex flex-col gap-0.5 overflow-hidden bg-dex-frame-dark">
        {children}
      </div>
    </div>
  );
}

// Inclina todo el interior. Es más ancho que la ficha (-mx) para que, al
// inclinarse, sus esquinas no dejen huecos en los bordes del marco.
// originY: altura del eje de la inclinación. La fila que está a esa altura no
// se desplaza, así su texto queda en una x fija (24 px) que puede alinearse
// con el título de la ficha
interface SkewedBlockProps {
  children: ReactNode;
  originY?: string;
}

export function SkewedBlock({ children, originY }: SkewedBlockProps) {
  return (
    <div
      className="flex flex-col gap-0.5 md:-mx-14 md:-skew-x-6"
      style={originY ? { transformOrigin: `50% ${originY}` } : undefined}
    >
      {children}
    </div>
  );
}

interface UprightProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// Deshace la inclinación del bloque para que el contenido se lea recto
export function Upright({ children, className = "", style }: UprightProps) {
  return (
    <div
      className={`flex items-center gap-2 md:skew-x-6 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

// La inclinación desplaza cada fila hacia la izquierda (alto de fila × tan 6°)
// respecto a la anterior. Esta clase mueve el contenido lo mismo a la derecha
// para que quede alineado en una columna recta. Usa --row (posición de la fila)
// y --pitch (alto exacto de cada fila, definido por la tabla)
const ALIGN_TO_COLUMN =
  "md:translate-x-[calc(var(--row)*var(--pitch)*tan(6deg))]";

interface InfoTableProps {
  children: ReactNode;
  // Para alinear contenido en columna recta: alto fijo de fila y --pitch con
  // ese mismo alto, p. ej. "[--pitch:3rem] [&>div]:h-12"
  className?: string;
}

// Las filas pares alternan tono para seguir cada fila con la vista: gris claro
// en el valor y un azul marino algo más oscuro en la etiqueta
// (las rayas se mantienen, solo cambia el color de fondo)
export function InfoTable({ children, className = "" }: InfoTableProps) {
  return (
    <dl
      className={`divide-y-2 divide-dex-frame-dark [&>div:nth-child(even)>dd]:from-dex-cell [&>div:nth-child(even)>dd]:to-[#d3dce7] [&>div:nth-child(even)>dt]:bg-[#34405a] ${className}`}
    >
      {children}
    </dl>
  );
}

interface InfoRowProps {
  label: string;
  children: ReactNode;
  // Alineación y relleno del valor
  // El relleno derecho compensa la parte que el marco recorta de las celdas exteriores al inclinarse
  valueClassName?: string;
  // false: el contenido decide qué enderezar (las barras de estadísticas se quedan inclinadas a propósito)
  upright?: boolean;
  // Reparto de columnas de la fila y relleno de la etiqueta, para que una tabla
  // pueda alinear su costura con la de otra sección de la ficha
  columnsClassName?: string;
  labelClassName?: string;
  // Posición de la fila (0, 1, 2…) y qué alinear en columna recta en vez de
  // seguir la diagonal. La tabla debe fijar el alto de fila (ver InfoTable)
  alignRow?: number;
  alignLabel?: boolean;
  alignValue?: boolean;
}

export function InfoRow({
  label,
  children,
  valueClassName = "justify-center text-center md:pr-28",
  upright = true,
  columnsClassName = "grid-cols-[minmax(7rem,38%)_1fr]",
  labelClassName = "md:pl-12",
  alignRow,
  alignLabel = false,
  alignValue = false,
}: InfoRowProps) {
  return (
    <div
      className={`grid ${columnsClassName}`}
      style={
        alignRow !== undefined
          ? ({ "--row": alignRow } as CSSProperties)
          : undefined
      }
    >
      <dt
        className={`flex items-center px-3 py-2 text-white pixel-shadow-dark ${labelClassName} ${STRIPED_NAVY}`}
      >
        <Upright className={alignLabel ? ALIGN_TO_COLUMN : ""}>
          <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-white" />
          {label}
        </Upright>
      </dt>
      <dd
        className={`flex min-h-10 items-center gap-2 bg-linear-to-b from-white to-[#eef2f7] px-3 py-1.5 ${valueClassName}`}
      >
        {upright ? (
          <Upright
            className={`flex-wrap justify-center ${alignValue ? ALIGN_TO_COLUMN : ""}`}
          >
            {children}
          </Upright>
        ) : (
          children
        )}
      </dd>
    </div>
  );
}

// Franja de sección a todo el ancho
// Mide lo mismo que una fila de estadísticas (h-12) para que estas se alineen con su texto
export function InfoSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex h-12 items-center bg-dex-select px-3 font-bold text-white uppercase pixel-shadow-ink md:pl-20">
      <Upright>{children}</Upright>
    </h2>
  );
}
