import { useEffect, useState } from "react";
import { getCollection } from "../api/collection";
import { getErrorMessage } from "../api/errors";
import type { CollectionListParams, CollectionPage } from "../types/collection";

interface CollectionResult {
  key: string;
  data: CollectionPage | null;
  error: string | null;
}

// Igual que usePokemonList, pero sin caché de páginas: la colección cambia al
// capturar o liberar, y una página cacheada mostraría por un momento un
// Pokémon que ya se liberó
export function useCollection({
  page,
  limit,
  name,
  type,
}: CollectionListParams) {
  const [reloadKey, setReloadKey] = useState(0);
  const key = JSON.stringify([page, limit, name, type, reloadKey]);
  const [result, setResult] = useState<CollectionResult | null>(null);

  useEffect(() => {
    // Si cambian los parámetros antes de que llegue la respuesta, se ignora la anterior
    let ignore = false;

    getCollection({ page, limit, name, type })
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
  }, [key, page, limit, name, type]);

  // Está cargando mientras el último resultado sea de otros parámetros.
  // Mientras tanto se siguen devolviendo los datos anteriores
  const loading = result?.key !== key;

  return {
    data: result?.data ?? null,
    error: loading ? null : (result?.error ?? null),
    loading,
    retry: () => setReloadKey((k) => k + 1),
  };
}
