import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function parseTypes(value: string | null): string[] {
  const types = (value ?? "").split(",").filter(Boolean);
  return [...new Set(types)].slice(0, 2);
}

// Página, búsqueda y tipos viven en la URL (?name=char&type=fire,flying&page=2):
// recargar, volver atrás o compartir el enlace conserva los filtros.
// Lo usan la Pokédex y Mi colección
export function useListFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const name = searchParams.get("name")?.trim() ?? "";
  // Hasta 2 tipos separados por coma (?type=fire,flying)
  const selectedTypes = parseTypes(searchParams.get("type"));
  const filtered = Boolean(name || selectedTypes.length);

  // Cambiar un filtro vuelve a la página 1
  // Los valores vacíos se quitan de la URL para que quede limpia
  const updateFilters = useCallback(
    (changes: { name?: string; type?: string }, replace = false) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(changes)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          next.delete("page");
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  // Al escribir se reemplaza la entrada del historial en vez de añadir una
  // nueva, para que "atrás" no recorra la búsqueda letra por letra
  const handleNameChange = useCallback(
    (newName: string) => updateFilters({ name: newName }, true),
    [updateFilters],
  );

  const handleTypesChange = useCallback(
    (newTypes: string[]) => updateFilters({ type: newTypes.join(",") }),
    [updateFilters],
  );

  // replace: para redirigir sin dejar la página anterior en el historial
  const goToPage = useCallback(
    (newPage: number, replace = false) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newPage === 1) next.delete("page");
          else next.set("page", String(newPage));
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(
    () => setSearchParams({}),
    [setSearchParams],
  );

  return {
    page,
    name,
    selectedTypes,
    filtered,
    handleNameChange,
    handleTypesChange,
    goToPage,
    clearFilters,
  };
}
