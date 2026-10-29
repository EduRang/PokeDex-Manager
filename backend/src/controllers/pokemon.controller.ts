import type { Request, Response } from "express";
import {
  pokemonIdParamSchema,
  pokemonListQuerySchema,
  pokemonSearchQuerySchema,
} from "../validators/pokemon.validators.js";
import {
  getPokemonDetail,
  listPokemon,
  searchPokemon,
} from "../services/pokemon.service.js";

export async function getPokemonList(req: Request, res: Response) {
  const { page, limit } = pokemonListQuerySchema.parse(req.query);
  res.json(await listPokemon(page, limit));
}

export async function searchPokemonByName(req: Request, res: Response) {
  const { name, page, limit } = pokemonSearchQuerySchema.parse(req.query);
  res.json(await searchPokemon(name, page, limit));
}

export async function getPokemon(req: Request, res: Response) {
  const { id } = pokemonIdParamSchema.parse(req.params);
  const pokemon = await getPokemonDetail(id);
  res.json({ pokemon });
}
