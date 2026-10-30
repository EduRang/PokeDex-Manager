import { PAGE_SIZE, useListFilters } from "../hooks/useListFilters";
import { usePokemonList } from "../hooks/usePokemonList";
import { usePokemonTypes } from "../hooks/usePokemonTypes";
import { PokemonFilters } from "../components/PokemonFilters";
import { PokemonGrid, ResultsError } from "../components/PokemonResults";
import { SectionSpinner } from "../components/Spinner";
import { MessagePanel } from "../components/Panel";
import { Button } from "../components/Button";
import { PokemonCountBadge } from "../components/PokemonCountBadge";
import type { PokemonPage } from "../types/pokemon";

export function PokemonListPage() {
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

  const { data, error, loading, retry } = usePokemonList({
    page,
    limit: PAGE_SIZE,
    type: selectedTypes.join(",") || undefined,
    name: name || undefined,
  });
  const { types, labels } = usePokemonTypes();

  return (
    <section className="space-y-6">
      {/* El título ya está en la barra superior. Esto es solo para lectores de pantalla */}
      <h1 className="sr-only">Pokédex</h1>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        {data && (
          <PokemonCountBadge
            total={data.pagination.total}
            label={filtered ? "Pokémon encontrados" : "Pokémon en total"}
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
      <ResultsError
        message={error}
        filtered={filtered}
        onRetry={onRetry}
        onClearFilters={onClearFilters}
      />
    );
  }

  if (!data) {
    return <SectionSpinner />;
  }

  const { pokemon, pagination } = data;

  if (pokemon.length === 0) {
    // Total 0 = los filtros no encuentran nada. Si hay total, la página no existe
    const noMatches = pagination.total === 0;
    return (
      <MessagePanel>
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
      </MessagePanel>
    );
  }

  return (
    <PokemonGrid
      pokemon={pokemon}
      pagination={pagination}
      loading={loading}
      typeLabels={typeLabels}
      onPageChange={onPageChange}
    />
  );
}
