interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Botones usados para la paginacion
const segmentButtonClass =
  "relative flex items-center gap-1.5 bg-dex-ink px-3 pt-1.5 pb-2.5 text-white pixel-shadow-ink shadow-[inset_0_-4px_0_0_var(--color-dex-ink-dark)] transition hover:bg-dex-select focus-visible:z-10 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-dex-accent focus-visible:ring-2 focus-visible:ring-white active:pt-2 active:pb-2 active:shadow-[inset_0_3px_0_0_var(--color-dex-ink-dark)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-dex-ink sm:px-4";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Una sola barra: acciones oscuras a los lados e información celeste en medio.
  // En pantallas pequeñas los botones solo muestran la flecha.
  // aria-label mantiene el nombre completo para lectores de pantalla
  return (
    <nav
      aria-label="Paginación"
      className="mx-auto flex w-fit max-w-full items-stretch rounded-md border-2 border-dex-frame-dark bg-dex-frame-dark shadow-[0_3px_0_0_rgb(0_0_0/0.2)]"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={`${segmentButtonClass} rounded-l`}
      >
        <span aria-hidden="true">◀</span>
        <span className="hidden sm:inline">Anterior</span>
      </button>

      <p className="flex items-center border-x-2 border-dex-frame-dark bg-dex-panel px-4 whitespace-nowrap pixel-shadow">
        Página&nbsp;<strong>{page}</strong>&nbsp;de&nbsp;
        <strong>{totalPages}</strong>
      </p>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className={`${segmentButtonClass} rounded-r`}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <span aria-hidden="true">▶</span>
      </button>
    </nav>
  );
}
