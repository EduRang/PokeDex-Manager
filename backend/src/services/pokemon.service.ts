import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";
import type { PokeApiPokemon, PokeApiResourceList } from "../types/pokeapi.js";
import { pokeApiGet } from "../clients/pokeapi.client.js";

// Mayor que el total de Pokémon, para traer el índice completo de una vez
const FULL_INDEX_LIMIT = 3000;

function toPokemonDetail(raw: PokeApiPokemon) {
  return {
    id: raw.id,
    name: raw.name,
    sprite: raw.sprites.front_default,
    types: [...raw.types]
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name),
    stats: raw.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    heightMeters: raw.height / 10, // PokéAPI usa decímetros
    weightKg: raw.weight / 10, // PokéAPI usa hectogramos
    abilities: [...raw.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({ name: a.ability.name, isHidden: a.is_hidden })),
  };
}

export type PokemonDetail = ReturnType<typeof toPokemonDetail>;

function toPokemonSummaries(raw: PokeApiResourceList) {
  return raw.results.map((r) => {
    const id = Number(r.url.match(/\/(\d+)\/?$/)?.[1]);
    // Los sprites siguen un patrón por id, así no hace falta pedir el detalle
    // de cada Pokémon solo para mostrar su imagen en el listado
    return { id, name: r.name, sprite: `${env.POKEAPI_SPRITES_URL}/${id}.png` };
  });
}

export type PokemonSummary = ReturnType<typeof toPokemonSummaries>[number];

/** Busca por número de Pokédex o por nombre exacto. */
export async function getPokemonDetail(
  idOrName: string,
): Promise<PokemonDetail> {
  const pokemon = await pokeApiGet(`/pokemon/${idOrName}`, toPokemonDetail);
  if (!pokemon) {
    throw new HttpError(404, "Pokémon no encontrado");
  }
  return pokemon;
}

// Índice completo (nombre + id) en una sola llamada cacheada
// Paginar sobre él en memoria evita pedir a PokéAPI una página distinta cada vez
async function getPokemonIndex(): Promise<PokemonSummary[]> {
  const index = await pokeApiGet(
    `/pokemon?limit=${FULL_INDEX_LIMIT}`,
    toPokemonSummaries,
  );
  if (!index) {
    throw new HttpError(502, "PokéAPI no está disponible en este momento");
  }
  return index;
}

function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  return {
    pokemon: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

export async function listPokemon(page: number, limit: number) {
  return paginate(await getPokemonIndex(), page, limit);
}

// Búsqueda parcial por nombre
export async function searchPokemon(name: string, page: number, limit: number) {
  const matches = (await getPokemonIndex()).filter((p) =>
    p.name.includes(name),
  );
  const startsWith = matches.filter((p) => p.name.startsWith(name));
  const contains = matches.filter((p) => !p.name.startsWith(name));
  return paginate([...startsWith, ...contains], page, limit);
}
