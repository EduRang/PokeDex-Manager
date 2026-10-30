import type {
  Pagination as PaginationData,
  PokemonListItem,
} from "../types/pokemon";
import type { DetailLinkState } from "../utils/navigation";
import { Button } from "./Button";
import { Pagination } from "./Pagination";
import { MessagePanel } from "./Panel";
import { PokemonCard } from "./PokemonCard";

// Piezas comunes de los resultados de la Pokédex y de "Mi colección".
// Los estados vacíos son distintos en cada página, así que los decide cada una

interface ResultsErrorProps {
  message: string;
  filtered: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
}

// Con filtros activos también ofrece quitarlos, por si son la causa
export function ResultsError({
  message,
  filtered,
  onRetry,
  onClearFilters,
}: ResultsErrorProps) {
  return (
    <MessagePanel>
      <p>{message}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button onClick={onRetry}>Reintentar</Button>
        {filtered && (
          <Button variant="secondary" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>
    </MessagePanel>
  );
}

interface PokemonGridProps {
  pokemon: PokemonListItem[];
  pagination: PaginationData;
  loading: boolean;
  typeLabels: Record<string, string>;
  linkState?: DetailLinkState; // Desde dónde se abren las fichas
  onPageChange: (page: number) => void;
}

export function PokemonGrid({
  pokemon,
  pagination,
  loading,
  typeLabels,
  linkState,
  onPageChange,
}: PokemonGridProps) {
  return (
    <>
      {/* Mientras carga otra página se mantiene la actual, semitransparente */}
      <ul
        aria-busy={loading}
        className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${loading ? "opacity-50" : ""}`}
      >
        {pokemon.map((p) => (
          <li key={p.id}>
            <PokemonCard
              pokemon={p}
              typeLabels={typeLabels}
              linkState={linkState}
            />
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
