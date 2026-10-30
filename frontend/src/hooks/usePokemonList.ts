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

// Caché en memoria de las páginas ya vistas. Al volver desde el detalle, la
// lista se pinta al instante con estos datos, así ScrollRestoration puede
// devolver al usuario a la tarjeta que abrió.
// Igualmente se vuelve a pedir la página para tenerla al día
const MAX_CACHED_PAGES = 50;
const pageCache = new Map<string, PokemonPage>();

function cachePage(key: string, page: PokemonPage) {
  pageCache.delete(key);
  pageCache.set(key, page);
  if (pageCache.size > MAX_CACHED_PAGES) {
    const oldest = pageCache.keys().next().value;
    if (oldest !== undefined) pageCache.delete(oldest);
  }
}

export function usePokemonList({
  page,
  limit,
  type,
  name,
}: UsePokemonListParams) {
  const paramsKey = JSON.stringify([page, limit, type, name]);
  const [reloadKey, setReloadKey] = useState(0);
  const key = JSON.stringify([paramsKey, reloadKey]);

  const [result, setResult] = useState<ListResult | null>(() => {
    const cached = pageCache.get(paramsKey);
    return cached ? { key, data: cached, error: null } : null;
  });

  useEffect(() => {
    // Si cambian los parámetros antes de que llegue la respuesta, se ignora
    // la anterior para no mostrar una página que ya no se pidió
    let ignore = false;

    const request = name
      ? searchPokemon({ name, page, limit, type })
      : getPokemonList({ page, limit, type });

    request
      .then((data) => {
        cachePage(paramsKey, data);
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
  }, [key, paramsKey, page, limit, type, name]);

  const retry = () => setReloadKey((k) => k + 1);

  // Una página ya vista se muestra al instante desde el caché,
  // mientras se actualiza en segundo plano
  const cached = pageCache.get(paramsKey);
  if (result?.key !== key && cached) {
    return { data: cached, error: null, loading: false, retry };
  }

  // Está cargando mientras el último resultado sea de otros parámetros.
  // Mientras tanto se siguen devolviendo los datos anteriores.
  const loading = result?.key !== key;

  return {
    data: result?.data ?? null,
    error: loading ? null : (result?.error ?? null),
    loading,
    retry,
  };
}
