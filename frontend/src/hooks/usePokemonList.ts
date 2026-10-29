import { useEffect, useState } from "react";
import { getPokemonList, searchPokemon } from "../api/pokemon";
import { getErrorMessage } from "../api/errors";
import type { PokemonListParams, PokemonPage } from "../types/pokemon";

interface ListResult {
  key: string;
  data: PokemonPage | null;
  error: string | null;
}

interface UsePokemonListParams extends PokemonListParams {
  name?: string; // Si viene, se usa la búsqueda en vez del listado
}

export function usePokemonList({
  page,
  limit,
  type,
  name,
}: UsePokemonListParams) {
  const [result, setResult] = useState<ListResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const key = JSON.stringify([page, limit, type, name, reloadKey]);

  useEffect(() => {
    // Si cambian los parámetros antes de que llegue la respuesta, se ignora
    // la anterior para no mostrar una página que ya no se pidió
    let ignore = false;

    const request = name
      ? searchPokemon({ name, page, limit, type })
      : getPokemonList({ page, limit, type });

    request
      .then((data) => {
        if (!ignore) setResult({ key, data, error: null });
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setResult((prev) => ({
            key,
            data: prev?.data ?? null,
            error: getErrorMessage(err),
          }));
        }
      });

    return () => {
      ignore = true;
    };
  }, [key, page, limit, type, name]);

  // Está cargando mientras el último resultado sea de otros parámetros.
  // Mientras tanto se siguen devolviendo los datos anteriores.
  const loading = result?.key !== key;

  return {
    data: result?.data ?? null,
    error: loading ? null : (result?.error ?? null),
    loading,
    retry: () => setReloadKey((k) => k + 1),
  };
}
