import type { Request, Response } from "express";
import {
  collectionListQuerySchema,
  collectionPokemonParamSchema,
} from "../validators/collection.validators.js";
import {
  addToCollection,
  listCollection,
  removeFromCollection,
} from "../services/collection.service.js";

// Como en la Pokédex: el parámetro "type" llega validado como lista de tipos
export async function getCollection(req: Request, res: Response) {
  const { type, ...query } = collectionListQuerySchema.parse(req.query);
  res.json(await listCollection(req.userId!, { ...query, types: type }));
}

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
