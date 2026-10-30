import { useId, useState, type SubmitEvent } from "react";
import { PencilIcon } from "./PencilIcon";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | "start-gap" | "end-gap";

// Números visibles alrededor de la página actual, siempre con la primera y la última.
// Con huecos ("…") cuando faltan al menos 2 páginas.
// La cantidad de elementos es fija para que la barra no cambie de ancho al avanzar
// (siblings = 2, página 7 de 68): 1 … 5 6 [7] 8 9 … 68
function getPageItems(
  page: number,
  totalPages: number,
  siblings: number,
): PageItem[] {
  const start = Math.max(
    Math.min(page - siblings, totalPages - siblings * 2 - 2),
    3,
  );
  const end = Math.min(
    Math.max(page + siblings, siblings * 2 + 3),
    totalPages - 2,
  );

  const items: PageItem[] = [1];
  if (start > 3) items.push("start-gap");
  else if (totalPages > 3) items.push(2);
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 2) items.push("end-gap");
  else if (totalPages > 2) items.push(totalPages - 1);
  if (totalPages > 1) items.push(totalPages);
  return items;
}

// Segmentos oscuros de la barra
const segmentButtonClass =
  "relative flex items-center justify-center gap-1.5 bg-dex-ink pt-1.5 pb-2.5 text-white pixel-shadow-ink shadow-[inset_0_-4px_0_0_var(--color-dex-ink-dark)] transition hover:bg-dex-select focus-visible:z-10 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-dex-accent focus-visible:ring-2 focus-visible:ring-white active:pt-2 active:pb-2 active:shadow-[inset_0_3px_0_0_var(--color-dex-ink-dark)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-dex-ink";
const arrowButtonClass = `${segmentButtonClass} px-3 lg:px-4`;
const numberButtonClass = `${segmentButtonClass} min-w-10 px-2.5`;

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Una sola barra: flechas a los lados, números en medio.
  // En móvil solo cabe 1 … [7] … 68, así que ahí los números 1 y 68
  // reemplazan a los botones de primera/última página,
  // y los textos solo aparecen en pantallas anchas.
  // aria-label mantiene el nombre completo para lectores de pantalla
  return (
    <div className="flex flex-col items-center gap-3">
      <nav
        aria-label="Paginación"
        // El fondo claro asoma entre los segmentos como divisor
        className="flex w-fit max-w-full items-stretch gap-0.5 rounded-md border-2 border-dex-frame-dark bg-dex-muted shadow-[0_3px_0_0_rgb(0_0_0/0.2)]"
      >
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          aria-label="Primera página"
          title="Primera página"
          className={`${arrowButtonClass} hidden rounded-l sm:flex`}
        >
          <span aria-hidden="true">|◀</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          title="Página anterior"
          className={`${arrowButtonClass} rounded-l sm:rounded-none`}
        >
          <span aria-hidden="true">◀</span>
          <span className="hidden lg:inline">Anterior</span>
        </button>

        <PageNumbers
          items={getPageItems(page, totalPages, 0)}
          page={page}
          onPageChange={onPageChange}
          className="flex sm:hidden"
        />
        <PageNumbers
          items={getPageItems(page, totalPages, 2)}
          page={page}
          onPageChange={onPageChange}
          className="hidden sm:flex"
        />

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
          title="Página siguiente"
          className={`${arrowButtonClass} rounded-r sm:rounded-none`}
        >
          <span className="hidden lg:inline">Siguiente</span>
          <span aria-hidden="true">▶</span>
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Última página"
          title="Última página"
          className={`${arrowButtonClass} hidden rounded-r sm:flex`}
        >
          <span aria-hidden="true">▶|</span>
        </button>
      </nav>

      <PageJump
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

interface PageNumbersProps {
  items: PageItem[];
  page: number;
  onPageChange: (page: number) => void;
  className: string;
}

function PageNumbers({
  items,
  page,
  onPageChange,
  className,
}: PageNumbersProps) {
  return (
    <div className={`items-stretch gap-0.5 ${className}`}>
      {items.map((item) =>
        typeof item !== "number" ? (
          <span
            key={item}
            aria-hidden="true"
            className="flex items-center bg-dex-ink px-1.5 text-white/60"
          >
            …
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            aria-label={`Página ${item}, actual`}
            className="flex min-w-10 items-center justify-center bg-dex-panel px-2.5 font-bold pixel-shadow"
          >
            {item}
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-label={`Página ${item}`}
            className={numberButtonClass}
          >
            {item}
          </button>
        ),
      )}
    </div>
  );
}

interface PageJumpProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// "Página [7] de 68 [Ir]": se escribe el número y se va con Enter o con "Ir".
// Salir del campo sin confirmar lo deja otra vez en la página actual.
// El borde punteado y el lápiz indican que el número se puede editar.
// "Ir" solo se habilita mientras se edita (el campo tiene el foco)
function PageJump({ page, totalPages, onPageChange }: PageJumpProps) {
  const inputId = useId();
  const [editing, setEditing] = useState(false);

  // Solo dígitos: sin signos, decimales ni exponentes ("-2", "3.5", "1e3").
  // Se permite "0" solo, pero un cero a la izquierda de otro número se quita
  // ("0" + "5" -> "5"; "5" delante de "0" -> "50")
  function keepDigits(input: HTMLInputElement) {
    input.value = input.value
      .replace(/\D/g, "")
      .replace(/^0+(?=\d)/, "")
      .slice(0, String(totalPages).length);
  }

  function commit(input: HTMLInputElement) {
    // Campo vacío: vuelve a la página actual
    if (input.value === "") {
      input.value = String(page);
      return;
    }
    // 0 lleva a la primera página y un número mayor que el total, a la última
    const clamped = Math.min(Math.max(Number(input.value), 1), totalPages);
    input.value = String(clamped);
    if (clamped !== page) {
      // El campo se vuelve a montar con la nueva página y pierde el foco sin
      // disparar onBlur, así que la edición se termina aquí
      setEditing(false);
      onPageChange(clamped);
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("page");
    if (input instanceof HTMLInputElement) commit(input);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 rounded-md border-2 border-dex-frame-dark bg-white px-3 py-1.5 shadow-[0_3px_0_0_rgb(0_0_0/0.2)]"
    >
      <label htmlFor={inputId}>Página</label>
      <div className="relative flex items-center">
        <input
          // Al cambiar de página se vuelve a montar con el nuevo valor
          key={page}
          id={inputId}
          name="page"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="go"
          autoComplete="off"
          defaultValue={page}
          title="Escribe un número para ir a esa página"
          onChange={(event) => keepDigits(event.currentTarget)}
          onBlur={(event) => {
            event.currentTarget.value = String(page);
            setEditing(false);
          }}
          onFocus={(event) => {
            event.currentTarget.select();
            setEditing(true);
          }}
          className="w-18 cursor-text rounded-sm border-2 border-dashed border-dex-muted bg-dex-panel py-0.5 pr-7 pl-2 text-center font-bold transition hover:border-solid hover:border-dex-select focus:border-solid focus:border-dex-frame focus:bg-white focus:outline-4 focus:outline-offset-1 focus:outline-dex-accent"
        />
        <PencilIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-2 size-3.5"
        />
      </div>
      <span>
        de <strong>{totalPages}</strong>
      </span>
      <button
        type="submit"
        disabled={!editing}
        // Evita que el campo pierda el foco al pulsar: si no, onBlur
        // devolvería el número a la página actual antes de enviarlo
        onMouseDown={(event) => event.preventDefault()}
        className={`${arrowButtonClass} rounded-sm`}
      >
        Ir
        <span aria-hidden="true">▶</span>
      </button>
    </form>
  );
}
