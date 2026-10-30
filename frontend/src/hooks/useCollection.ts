import { useEffect, useState } from "react";
import { getCollection } from "../api/collection";
import { getErrorMessage } from "../api/errors";
import type { CollectionListParams, CollectionPage } from "../types/collection";

interface CollectionResult {
  key: string;
  data: CollectionPage | null;
  error: string | null;
}

// Caché en memoria de las páginas ya vistas, como en usePokemonList: al volver
// desde una ficha, la colección se pinta al instante y ScrollRestoration puede
// devolver al usuario a la tarjeta que abrió. Igualmente se vuelve a pedir la
// página para tenerla al día.
// A diferencia de la Pokédex, la colección cambia: el caché se vacía al
// capturar o liberar y al cerrarse la sesión, para no mostrar un Pokémon ya
// liberado ni la colección de otro usuario
const MAX_CACHED_PAGES = 50;
const pageCache = new Map<string, CollectionPage>();
// Cambia en cada vaciado. Una respuesta pedida antes de vaciar el caché ya no
// se guarda, porque podría incluir un Pokémon que se acaba de liberar
let cacheGeneration = 0;

function cachePage(key: string, page: CollectionPage) {
  pageCache.delete(key);
  pageCache.set(key, page);
  if (pageCache.size > MAX_CACHED_PAGES) {
    const oldest = pageCache.keys().next().value;
    if (oldest !== undefined) pageCache.delete(oldest);
  }
}

export function clearCollectionCache() {
  pageCache.clear();
  cacheGeneration++;
}

export function useCollection({
  page,
  limit,
  name,
  type,
}: CollectionListParams) {
  const paramsKey = JSON.stringify([page, limit, name, type]);
  const [reloadKey, setReloadKey] = useState(0);
  const key = JSON.stringify([paramsKey, reloadKey]);

  const [result, setResult] = useState<CollectionResult | null>(() => {
    const cached = pageCache.get(paramsKey);
    return cached ? { key, data: cached, error: null } : null;
  });

  useEffect(() => {
    // Si cambian los parámetros antes de que llegue la respuesta, se ignora la anterior
    let ignore = false;
    const generation = cacheGeneration;

    getCollection({ page, limit, name, type })
      .then((data) => {
        if (generation === cacheGeneration) cachePage(paramsKey, data);
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
  }, [key, paramsKey, page, limit, name, type]);

  const retry = () => setReloadKey((k) => k + 1);

  // Una página ya vista se muestra al instante desde el caché,
  // mientras se actualiza en segundo plano
  const cached = pageCache.get(paramsKey);
  if (result?.key !== key && cached) {
    return { data: cached, error: null, loading: false, retry };
  }

  // Está cargando mientras el último resultado sea de otros parámetros.
  // Mientras tanto se siguen devolviendo los datos anteriores
  const loading = result?.key !== key;

  return {
    data: result?.data ?? null,
    error: loading ? null : (result?.error ?? null),
    loading,
    retry,
  };
}
