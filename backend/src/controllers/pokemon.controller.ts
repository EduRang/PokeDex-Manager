import type { Request, Response } from "express";
import {
  pokemonIdParamSchema,
  pokemonListQuerySchema,
  pokemonSearchQuerySchema,
} from "../validators/pokemon.validators.js";
import {
  getPokemonDetail,
  getPokemonNeighbors,
  listPokemon,
  listPokemonTypes,
  searchPokemon,
} from "../services/pokemon.service.js";
import { isInCollection } from "../services/collection.service.js";

// El parámetro de la URL se llama "type", pero ya validado es una
// lista de hasta 2 tipos, por eso el servicio lo recibe como "types"
export async function getPokemonList(req: Request, res: Response) {
  const { type, ...query } = pokemonListQuerySchema.parse(req.query);
  res.json(await listPokemon({ ...query, types: type }));
}

export async function searchPokemonByName(req: Request, res: Response) {
  const { type, ...query } = pokemonSearchQuerySchema.parse(req.query);
  res.json(await searchPokemon({ ...query, types: type }));
}

export async function getPokemonTypes(_req: Request, res: Response) {
  res.json({ types: await listPokemonTypes() });
}

export async function getPokemon(req: Request, res: Response) {
  const { id } = pokemonIdParamSchema.parse(req.params);
  const pokemon = await getPokemonDetail(id);
  // inCollection va fuera de "pokemon": depende del usuario, no del Pokémon
  const [neighbors, inCollection] = await Promise.all([
    getPokemonNeighbors(pokemon.id),
    isInCollection(req.userId!, pokemon.id),
  ]);
  res.json({ pokemon, ...neighbors, inCollection });
}
