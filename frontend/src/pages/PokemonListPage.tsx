import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePokemonList } from "../hooks/usePokemonList";
import { usePokemonTypes } from "../hooks/usePokemonTypes";
import { PokemonCard } from "../components/PokemonCard";
import { PokemonFilters } from "../components/PokemonFilters";
import { Pagination } from "../components/Pagination";
import { Spinner } from "../components/Spinner";
import { Panel } from "../components/Panel";
import { Button } from "../components/Button";
import { PokemonCountBadge } from "../components/PokemonCountBadge";
import type { PokemonPage } from "../types/pokemon";

const PAGE_SIZE = 20;

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function parseTypes(value: string | null): string[] {
  const types = (value ?? "").split(",").filter(Boolean);
  return [...new Set(types)].slice(0, 2);
}

// Página, búsqueda y tipos viven en la URL (?name=char&type=fire,flying&page=2):
// recargar, volver atrás o compartir el enlace conserva los filtros
export function PokemonListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const name = searchParams.get("name")?.trim() ?? "";
  // Hasta 2 tipos separados por coma (?type=fire,flying)
  const selectedTypes = parseTypes(searchParams.get("type"));
  const filtered = Boolean(name || selectedTypes.length);

  const { data, error, loading, retry } = usePokemonList({
    page,
    limit: PAGE_SIZE,
    type: selectedTypes.join(",") || undefined,
    name: name || undefined,
  });
  const { types, labels } = usePokemonTypes();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

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

  function goToPage(newPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage === 1) next.delete("page");
      else next.set("page", String(newPage));
      return next;
    });
  }

  function clearFilters() {
    setSearchParams({});
  }

  return (
    <section className="space-y-6">
      {/* El título ya está en la barra superior. Esto es solo para lectores de pantalla */}
      <h1 className="sr-only">Pokédex</h1>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        {data && (
          <PokemonCountBadge
            total={data.pagination.total}
            filtered={filtered}
          />
        )}
        <PokemonFilters
          name={name}
          selectedTypes={selectedTypes}
          typeOptions={types}
          typeLabels={labels}
          onNameChange={handleNameChange}
          onTypesChange={(newTypes) =>
            updateFilters({ type: newTypes.join(",") })
          }
          onClear={clearFilters}
          className="flex-1"
        />
      </div>

      <PokemonResults
        data={data}
        error={error}
        loading={loading}
        filtered={filtered}
        typeLabels={labels}
        onRetry={retry}
        onPageChange={goToPage}
        onClearFilters={clearFilters}
      />
    </section>
  );
}

interface PokemonResultsProps {
  data: PokemonPage | null;
  error: string | null;
  loading: boolean;
  filtered: boolean;
  typeLabels: Record<string, string>;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

// Los filtros quedan siempre visibles; solo esta parte cambia según el estado
function PokemonResults({
  data,
  error,
  loading,
  filtered,
  typeLabels,
  onRetry,
  onPageChange,
  onClearFilters,
}: PokemonResultsProps) {
  if (error) {
    return (
      <Panel className="mx-auto max-w-md" contentClassName="p-6 text-center">
        <p>{error}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button onClick={onRetry}>Reintentar</Button>
          {filtered && (
            <Button variant="secondary" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </Panel>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const { pokemon, pagination } = data;

  if (pokemon.length === 0) {
    // Total 0 = los filtros no encuentran nada. Si hay total, la página no existe
    const noMatches = pagination.total === 0;
    return (
      <Panel className="mx-auto max-w-md" contentClassName="p-6 text-center">
        <p>
          {noMatches
            ? "No se encontraron Pokémon con esos filtros."
            : "Esta página no existe."}
        </p>
        <Button
          onClick={noMatches ? onClearFilters : () => onPageChange(1)}
          className="mt-4"
        >
          {noMatches ? "Limpiar filtros" : "Ir a la primera página"}
        </Button>
      </Panel>
    );
  }

  return (
    <>
      {/* Mientras carga otra página se mantiene la actual, semitransparente */}
      <ul
        aria-busy={loading}
        className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${loading ? "opacity-50" : ""}`}
      >
        {pokemon.map((p) => (
          <li key={p.id}>
            <PokemonCard pokemon={p} typeLabels={typeLabels} />
          </li>
        ))}
      </ul>

      {/* Con pocos resultados (una sola página) la paginación sobra */}
      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
