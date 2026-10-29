import type { Request, Response } from "express";
import { pokemonIdParamSchema } from "../validators/pokemon.validators.js";
import { getPokemonDetail } from "../services/pokemon.service.js";

export async function getPokemon(req: Request, res: Response) {
  const { id } = pokemonIdParamSchema.parse(req.params);
  const pokemon = await getPokemonDetail(id);
  res.json({ pokemon });
}
