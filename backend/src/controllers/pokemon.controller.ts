import type { Request, Response } from "express";
import {
  pokemonIdParamSchema,
  pokemonListQuerySchema,
  pokemonSearchQuerySchema,
} from "../validators/pokemon.validators.js";
import {
  getPokemonDetail,
  listPokemon,
  listPokemonTypes,
  searchPokemon,
} from "../services/pokemon.service.js";

export async function getPokemonList(req: Request, res: Response) {
  const query = pokemonListQuerySchema.parse(req.query);
  res.json(await listPokemon(query));
}

export async function searchPokemonByName(req: Request, res: Response) {
  const query = pokemonSearchQuerySchema.parse(req.query);
  res.json(await searchPokemon(query));
}

export async function getPokemonTypes(_req: Request, res: Response) {
  res.json({ types: await listPokemonTypes() });
}

export async function getPokemon(req: Request, res: Response) {
  const { id } = pokemonIdParamSchema.parse(req.params);
  const pokemon = await getPokemonDetail(id);
  res.json({ pokemon });
}
