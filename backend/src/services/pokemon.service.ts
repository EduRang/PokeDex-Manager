import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";
import type {
  PokeApiPokemon,
  PokeApiResourceList,
  PokeApiType,
} from "../types/pokeapi.js";
import type {
  Pagination,
  PokemonDetail,
  PokemonListItem,
  PokemonPage,
  PokemonSummary,
  PokemonType,
} from "../types/pokemon.js";
import { pokeApiGet } from "../clients/pokeapi.client.js";

// Mayor que el total de Pokémon, para traer el índice completo con una sola request
const FULL_INDEX_LIMIT = 3000;
// Igual que arriba, se piden todos con una sola request
const TYPE_LIST_LIMIT = 100;

function toPokemonDetail(raw: PokeApiPokemon): PokemonDetail {
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

function toPokemonSummaries(raw: PokeApiResourceList): PokemonSummary[] {
  return raw.results.map((r) => {
    const id = Number(r.url.match(/\/(\d+)\/?$/)?.[1]);
    // Los sprites siguen un patrón por id, así no hace falta pedir el detalle
    // de cada Pokémon solo para mostrar su imagen en el listado
    return { id, name: r.name, sprite: `${env.POKEAPI_SPRITES_URL}/${id}.png` };
  });
}

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

interface TypeInfo extends PokemonType {
  pokemon: { name: string; slot: number }[];
}

function toTypeInfo(raw: PokeApiType): TypeInfo {
  return {
    name: raw.name,
    // Nombre en español para la interfaz ("fire" -> "Fuego")
    label: raw.names.find((n) => n.language.name === "es")?.name ?? raw.name,
    pokemon: raw.pokemon.map((p) => ({ name: p.pokemon.name, slot: p.slot })),
  };
}

// Cada /type/{nombre} trae todos los Pokémon de ese tipo
// Con ~20 llamadas cacheadas se conocen los tipos de los pokemones
async function getTypeInfos(): Promise<TypeInfo[]> {
  const names = await pokeApiGet(
    `/type?limit=${TYPE_LIST_LIMIT}`,
    (raw: PokeApiResourceList) => raw.results.map((r) => r.name),
  );
  if (!names) {
    throw new HttpError(502, "PokéAPI no está disponible en este momento");
  }
  const infos = await Promise.all(
    names.map((name) => pokeApiGet(`/type/${name}`, toTypeInfo)),
  );
  // Los tipos sin Pokémon no sirven para filtrar
  return infos.filter((t): t is TypeInfo => t !== null && t.pokemon.length > 0);
}

function buildTypesByPokemon(typeInfos: TypeInfo[]): Map<string, string[]> {
  const slots = new Map<string, { slot: number; type: string }[]>();
  for (const type of typeInfos) {
    for (const p of type.pokemon) {
      const list = slots.get(p.name) ?? [];
      list.push({ slot: p.slot, type: type.name });
      slots.set(p.name, list);
    }
  }
  const typesByPokemon = new Map<string, string[]>();
  for (const [name, list] of slots) {
    typesByPokemon.set(
      name,
      list.sort((a, b) => a.slot - b.slot).map((t) => t.type),
    );
  }
  return typesByPokemon;
}

function paginate(
  items: PokemonListItem[],
  page: number,
  limit: number,
): PokemonPage {
  const start = (page - 1) * limit;
  const pagination: Pagination = {
    page,
    limit,
    total: items.length,
    totalPages: Math.ceil(items.length / limit),
  };
  return { pokemon: items.slice(start, start + limit), pagination };
}

interface ListQuery {
  types: string[];
  page: number;
  limit: number;
}

interface SearchQuery extends ListQuery {
  name: string;
}

// Entrada interna de queryPokemon
interface PokemonQuery extends ListQuery {
  name?: string;
}

// Sirve a ambas busquedas por listado o por nombre
// Name es optional porque: el listado no trae name, la búsqueda sí
async function queryPokemon({
  name,
  types,
  page,
  limit,
}: PokemonQuery): Promise<PokemonPage> {
  const [index, typeInfos] = await Promise.all([
    getPokemonIndex(),
    getTypeInfos(),
  ]);
  const typesByPokemon = buildTypesByPokemon(typeInfos);
  let items: PokemonListItem[] = index.map((p) => ({
    ...p,
    types: typesByPokemon.get(p.name) ?? [],
  }));

  if (types.length > 0) {
    const unknown = types.find((t) => !typeInfos.some((i) => i.name === t));
    if (unknown) {
      throw new HttpError(400, `Tipo de Pokémon desconocido: ${unknown}`);
    }
    // El Pokémon debe tener todos los tipos elegidos
    items = items.filter((p) => types.every((t) => p.types.includes(t)));
  }

  if (name) {
    const startsWith = items.filter((p) => p.name.startsWith(name));
    const contains = items.filter(
      (p) => !p.name.startsWith(name) && p.name.includes(name),
    );
    items = [...startsWith, ...contains];
  }

  return paginate(items, page, limit);
}

export async function listPokemon(query: ListQuery): Promise<PokemonPage> {
  return queryPokemon(query);
}

// Búsqueda parcial por nombre, combinable con el filtro por tipo
export async function searchPokemon(query: SearchQuery): Promise<PokemonPage> {
  return queryPokemon(query);
}

export async function listPokemonTypes(): Promise<PokemonType[]> {
  const typeInfos = await getTypeInfos();
  return typeInfos.map(({ name, label }) => ({ name, label }));
}
