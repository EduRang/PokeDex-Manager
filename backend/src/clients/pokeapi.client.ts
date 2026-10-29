import { LRUCache } from "lru-cache";
import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const CACHE_MAX_ENTRIES = 2000;
const REQUEST_TIMEOUT_MS = 8000; // 8 segundos

// lru-cache no admite null como valor, así que se envuelve el resultado
// data: null significa "no existe en PokéAPI" (404).
interface CacheEntry {
  data: unknown;
}

type MapFn = (raw: unknown) => unknown;

const cache = new LRUCache<string, CacheEntry, MapFn>({
  max: CACHE_MAX_ENTRIES,
  ttl: CACHE_TTL_MS,
  // Si llegan varias solicitudes iguales a la vez,
  // fetch() las agrupa en una sola llamada a PokéAPI
  fetchMethod: (path, _stale, { context: map }) => fetchAndMap(path, map),
});

/**
 * GET a PokéAPI con caché. `map` convierte la respuesta cruda en lo que
 * guardamos y devolvemos. Devuelve null si PokéAPI responde 404.
 */
export async function pokeApiGet<Raw, Result>(
  path: string,
  map: (raw: Raw) => Result,
): Promise<Result | null> {
  const entry = await cache.fetch(path, { context: map as MapFn });
  return (entry?.data ?? null) as Result | null;
}

async function fetchAndMap(path: string, map: MapFn): Promise<CacheEntry> {
  let response: Response;
  try {
    response = await fetch(`${env.POKEAPI_BASE_URL}${path}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    // Error de red o tiempo de espera agotado
    throw new HttpError(502, "No se pudo conectar con PokéAPI");
  }

  if (response.status === 404) {
    // También se cachea, para no repetir búsquedas de algo que no existe
    return { data: null };
  }

  if (!response.ok) {
    // Al lanzar el error no se guarda nada: puede ser un fallo temporal
    throw new HttpError(502, "PokéAPI no está disponible en este momento");
  }

  return { data: map(await response.json()) };
}
