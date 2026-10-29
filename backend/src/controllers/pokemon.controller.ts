import type { Request, Response } from "express";
import {
  pokemonIdParamSchema,
  pokemonListQuerySchema,
} from "../validators/pokemon.validators.js";
import { getPokemonDetail, listPokemon } from "../services/pokemon.service.js";

export async function getPokemonList(req: Request, res: Response) {
  const { page, limit } = pokemonListQuerySchema.parse(req.query);
  res.json(await listPokemon(page, limit));
}

export async function getPokemon(req: Request, res: Response) {
  const { id } = pokemonIdParamSchema.parse(req.params);
  const pokemon = await getPokemonDetail(id);
  res.json({ pokemon });
}
