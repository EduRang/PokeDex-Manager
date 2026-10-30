import type { Request, Response } from "express";
import { collectionPokemonParamSchema } from "../validators/collection.validators.js";
import {
  addToCollection,
  removeFromCollection,
} from "../services/collection.service.js";

// PUT es idempotente: 201 si se añadió, 204 si ya estaba
export async function addPokemonToCollection(req: Request, res: Response) {
  const { pokemonId } = collectionPokemonParamSchema.parse(req.params);
  const added = await addToCollection(req.userId!, pokemonId);
  res.status(added ? 201 : 204).end();
}

export async function removePokemonFromCollection(req: Request, res: Response) {
  const { pokemonId } = collectionPokemonParamSchema.parse(req.params);
  await removeFromCollection(req.userId!, pokemonId);
  res.status(204).end();
}
