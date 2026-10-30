import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCollection } from "../hooks/useCollection";
import { usePokemonTypes } from "../hooks/usePokemonTypes";
import { PokemonCard } from "../components/PokemonCard";
import { PokemonCountBadge } from "../components/PokemonCountBadge";
import { Pagination } from "../components/Pagination";
import { Panel } from "../components/Panel";
import { Spinner } from "../components/Spinner";
import { Button, LinkButton } from "../components/Button";
import type { CollectionPage as CollectionPageData } from "../types/collection";

const PAGE_SIZE = 20;

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

// La página vive en la URL (?page=2), igual que en la Pokédex
export function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const { data, error, loading, retry } = useCollection({
    page,
    limit: PAGE_SIZE,
  });
  const { labels } = usePokemonTypes();

  const goToPage = useCallback(
    (newPage: number, replace = false) => {
      setSearchParams(newPage === 1 ? {} : { page: String(newPage) }, {
        replace,
      });
    },
    [setSearchParams],
  );

  // Si la página pedida quedó vacía pero la colección no (por ejemplo, tras
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

      {data && (
        <PokemonCountBadge
          total={data.pagination.total}
          label="Pokémon capturados"
        />
      )}

      <CollectionResults
        data={data}
        error={error}
        loading={loading}
        typeLabels={labels}
        onRetry={retry}
        onPageChange={goToPage}
      />
    </section>
  );
}

interface CollectionResultsProps {
  data: CollectionPageData | null;
  error: string | null;
  loading: boolean;
  typeLabels: Record<string, string>;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}

function CollectionResults({
  data,
  error,
  loading,
  typeLabels,
  onRetry,
  onPageChange,
}: CollectionResultsProps) {
  if (error) {
    return (
      <Panel className="mx-auto max-w-md" contentClassName="p-6 text-center">
        <p>{error}</p>
        <Button onClick={onRetry} className="mt-4">
          Reintentar
        </Button>
      </Panel>
    );
  }

  // Sin datos todavía, o página vacía de una colección que no lo está:
  // CollectionPage está redirigiendo a la última página
  if (!data || (data.pokemon.length === 0 && data.pagination.total > 0)) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const { pokemon, pagination } = data;

  if (pokemon.length === 0) {
    return (
      <Panel className="mx-auto max-w-md" contentClassName="p-6 text-center">
        <p>
          Todavía no has capturado ningún Pokémon. Abre la ficha de uno en la
          Pokédex y pulsa <strong>Capturar</strong>.
        </p>
        <LinkButton to="/" className="mt-4">
          Ir a la Pokédex
        </LinkButton>
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
            <PokemonCard
              pokemon={p}
              typeLabels={typeLabels}
              linkState={{ from: "collection" }}
            />
          </li>
        ))}
      </ul>

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
