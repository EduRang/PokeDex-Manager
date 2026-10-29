import { HttpError } from "../errors/HttpError.js";
import type { PokeApiPokemon } from "../types/pokeapi.js";
import { pokeApiGet } from "../clients/pokeapi.client.js";

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
