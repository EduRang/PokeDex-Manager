import { useEffect, useState } from "react";
import { getPokemonDetail } from "../api/pokemon";
import { getErrorMessage, getErrorStatus } from "../api/errors";
import type { PokemonDetail } from "../types/pokemon";

// Resultado de la última solicitud terminada y a qué Pokémon corresponde
interface DetailResult {
  key: string;
  pokemon: PokemonDetail | null;
  error: string | null;
  notFound: boolean;
}

export function usePokemonDetail(idOrName: string) {
  const [result, setResult] = useState<DetailResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const key = JSON.stringify([idOrName, reloadKey]);

  useEffect(() => {
    // Si se cambia de Pokémon antes de que llegue la respuesta, se ignora la anterior
    let ignore = false;

    getPokemonDetail(idOrName)
      .then((pokemon) => {
        if (!ignore) setResult({ key, pokemon, error: null, notFound: false });
      })
      .catch((err: unknown) => {
        if (ignore) return;
        const notFound = getErrorStatus(err) === 404;
        setResult({
          key,
          pokemon: null,
          error: notFound ? null : getErrorMessage(err),
          notFound,
        });
      });

    return () => {
      ignore = true;
    };
  }, [key, idOrName]);

  // Está cargando mientras el último resultado sea de otro Pokémon
  const loading = result?.key !== key;

  return {
    pokemon: loading ? null : (result?.pokemon ?? null),
    error: loading ? null : (result?.error ?? null),
    notFound: !loading && Boolean(result?.notFound),
    loading,
    retry: () => setReloadKey((k) => k + 1),
  };
}
