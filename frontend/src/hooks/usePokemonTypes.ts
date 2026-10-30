import { useEffect, useState } from "react";
import { getPokemonTypes } from "../api/pokemon";
import type { PokemonType } from "../types/pokemon";

// Los tipos no cambian durante la sesión: se piden una vez y se reutilizan.
// Así, al volver a la lista, las etiquetas en español aparecen desde el primer
// pintado y las tarjetas no cambian de tamaño mientras se recupera el scroll
let cachedTypes: PokemonType[] | null = null;

// Si falla, la lista queda vacía y las insignias muestran el nombre original
export function usePokemonTypes() {
  const [types, setTypes] = useState<PokemonType[]>(() => cachedTypes ?? []);

  useEffect(() => {
    if (cachedTypes) return;
    let ignore = false;
    getPokemonTypes()
      .then((result) => {
        cachedTypes = result;
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
