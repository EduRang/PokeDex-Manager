import { useEffect, useState } from "react";
import { getPokemonTypes } from "../api/pokemon";
import type { PokemonType } from "../types/pokemon";

// Si falla, la lista queda vacía y las insignias muestran el nombre original
export function usePokemonTypes() {
  const [types, setTypes] = useState<PokemonType[]>([]);

  useEffect(() => {
    let ignore = false;
    getPokemonTypes()
      .then((result) => {
        if (!ignore) setTypes(result);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // "fire" -> "Fuego"
  const labels = Object.fromEntries(types.map((t) => [t.name, t.label]));

  return { types, labels };
}
