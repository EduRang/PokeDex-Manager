import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePokemonList } from "../hooks/usePokemonList";
import { usePokemonTypes } from "../hooks/usePokemonTypes";
import { PokemonCard } from "../components/PokemonCard";
import { Pagination } from "../components/Pagination";
import { Spinner } from "../components/Spinner";
import { Panel } from "../components/Panel";
import { Button } from "../components/Button";
import { PokemonCountBadge } from "../components/PokemonCountBadge";

const PAGE_SIZE = 20;

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export function PokemonListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get("page"));

  const { data, error, loading, retry } = usePokemonList({
    page,
    limit: PAGE_SIZE,
  });
  const { labels } = usePokemonTypes();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  function goToPage(newPage: number) {
    setSearchParams(newPage === 1 ? {} : { page: String(newPage) });
  }

  if (error) {
    return (
      <Panel className="mx-auto max-w-md" contentClassName="p-6 text-center">
        <p>{error}</p>
        <Button onClick={retry} className="mt-4">
          Reintentar
        </Button>
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
    return (
      <Panel className="mx-auto max-w-md" contentClassName="p-6 text-center">
        <p>Esta página no existe.</p>
        <Button onClick={() => goToPage(1)} className="mt-4">
          Ir a la primera página
        </Button>
      </Panel>
    );
  }

  return (
    <section className="space-y-6">
      {/* El título ya está en la barra superior. Esto es solo para lectores de pantalla */}
      <h1 className="sr-only">Pokédex</h1>

      <PokemonCountBadge total={pagination.total} />

      {/* Mientras carga otra página se mantiene la actual, semitransparente */}
      <ul
        aria-busy={loading}
        className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${loading ? "opacity-50" : ""}`}
      >
        {pokemon.map((p) => (
          <li key={p.id}>
            <PokemonCard pokemon={p} typeLabels={labels} />
          </li>
        ))}
      </ul>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={goToPage}
      />
    </section>
  );
}
