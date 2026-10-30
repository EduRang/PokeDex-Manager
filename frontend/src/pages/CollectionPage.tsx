import { useEffect } from "react";
import { useCollection } from "../hooks/useCollection";
import { PAGE_SIZE, useListFilters } from "../hooks/useListFilters";
import { usePokemonTypes } from "../hooks/usePokemonTypes";
import { PokemonCountBadge } from "../components/PokemonCountBadge";
import { PokemonFilters } from "../components/PokemonFilters";
import { PokemonGrid, ResultsError } from "../components/PokemonResults";
import { MessagePanel } from "../components/Panel";
import { SectionSpinner } from "../components/Spinner";
import { Button, LinkButton } from "../components/Button";
import type { CollectionPage as CollectionPageData } from "../types/collection";

// Búsqueda, tipos y página viven en la URL, igual que en la Pokédex
export function CollectionPage() {
  const {
    page,
    name,
    selectedTypes,
    filtered,
    handleNameChange,
    handleTypesChange,
    goToPage,
    clearFilters,
  } = useListFilters();

  const { data, error, loading, retry } = useCollection({
    page,
    limit: PAGE_SIZE,
    name: name || undefined,
    type: selectedTypes.join(",") || undefined,
  });
  const { types, labels } = usePokemonTypes();

  // Si la página pedida quedó vacía pero hay resultados (por ejemplo, tras
  // liberar el último Pokémon de la última página), se va a la nueva última.
  // replace evita que "atrás" vuelva a la página vacía y redirija otra vez
  const lastPage =
    data && !loading && data.pokemon.length === 0 && data.pagination.total > 0
      ? data.pagination.totalPages
      : null;
  useEffect(() => {
    if (lastPage !== null) goToPage(lastPage, true);
  }, [lastPage, goToPage]);

  return (
    <section className="space-y-6">
      <h1 className="sr-only">Mi colección</h1>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        {data && (
          <PokemonCountBadge
            total={data.pagination.total}
            label="Pokémon capturados"
          />
        )}
        <PokemonFilters
          name={name}
          selectedTypes={selectedTypes}
          typeOptions={types}
          typeLabels={labels}
          onNameChange={handleNameChange}
          onTypesChange={handleTypesChange}
          onClear={clearFilters}
          className="flex-1"
        />
      </div>

      <CollectionResults
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

interface CollectionResultsProps {
  data: CollectionPageData | null;
  error: string | null;
  loading: boolean;
  filtered: boolean;
  typeLabels: Record<string, string>;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onClearFilters: () => void;
}

// Los filtros quedan siempre visibles; solo esta parte cambia según el estado
function CollectionResults({
  data,
  error,
  loading,
  filtered,
  typeLabels,
  onRetry,
  onPageChange,
  onClearFilters,
}: CollectionResultsProps) {
  if (error) {
    return (
      <ResultsError
        message={error}
        filtered={filtered}
        onRetry={onRetry}
        onClearFilters={onClearFilters}
      />
    );
  }

  // Sin datos todavía, o página vacía con resultados en otras páginas:
  // CollectionPage está redirigiendo a la última página
  if (!data || (data.pokemon.length === 0 && data.pagination.total > 0)) {
    return <SectionSpinner />;
  }

  const { pokemon, pagination } = data;

  if (pokemon.length === 0) {
    // Con filtros, ninguno coincide; sin filtros, la colección está vacía
    return filtered ? (
      <MessagePanel>
        <p>Ningún Pokémon de tu colección coincide con esos filtros.</p>
        <Button onClick={onClearFilters} className="mt-4">
          Limpiar filtros
        </Button>
      </MessagePanel>
    ) : (
      <MessagePanel>
        <p>
          Todavía no has capturado ningún Pokémon. Abre la ficha de uno en la
          Pokédex y pulsa <strong>Capturar</strong>.
        </p>
        <LinkButton to="/" className="mt-4">
          Ir a la Pokédex
        </LinkButton>
      </MessagePanel>
    );
  }

  return (
    <PokemonGrid
      pokemon={pokemon}
      pagination={pagination}
      loading={loading}
      typeLabels={typeLabels}
      linkState={{ from: "collection" }}
      onPageChange={onPageChange}
    />
  );
}
