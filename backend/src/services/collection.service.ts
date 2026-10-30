import { CollectionEntryModel } from "../models/CollectionEntry.js";
import { HttpError } from "../errors/HttpError.js";
import { isDuplicateKeyError } from "../errors/mongoErrors.js";
import type { CollectionPage } from "../types/collection.js";
import { findPokemonById, getSpriteUrl } from "./pokemon.service.js";

/**
 * Añade un Pokémon a la colección del usuario, con una copia de su nombre y
 * tipos. Devuelve false si ya estaba (añadirlo otra vez no es un error).
 */
export async function addToCollection(
  userId: string,
  pokemonId: number,
): Promise<boolean> {
  const pokemon = await findPokemonById(pokemonId);
  if (!pokemon) {
    throw new HttpError(404, "Pokémon no encontrado");
  }

  // El índice único detecta si ya estaba, sin una consulta previa:
  // así dos solicitudes simultáneas no pueden añadirlo dos veces
  try {
    await CollectionEntryModel.create({
      user: userId,
      pokemonId,
      name: pokemon.name,
      types: pokemon.types,
    });
    return true;
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return false;
    }
    throw err;
  }
}

// Quitar uno que no estaba tampoco es un error
export async function removeFromCollection(
  userId: string,
  pokemonId: number,
): Promise<void> {
  await CollectionEntryModel.deleteOne({ user: userId, pokemonId });
}

// Usa el índice único { user, pokemonId }
export async function isInCollection(
  userId: string,
  pokemonId: number,
): Promise<boolean> {
  const entry = await CollectionEntryModel.exists({ user: userId, pokemonId });
  return entry !== null;
}

interface CollectionQuery {
  page: number;
  limit: number;
}

// Se lee solo desde MongoDB, sin depender de PokéAPI.
// La paginación la hace la base de datos con el índice { user, createdAt, _id }
export async function listCollection(
  userId: string,
  { page, limit }: CollectionQuery,
): Promise<CollectionPage> {
  const filter = { user: userId };
  const [entries, total] = await Promise.all([
    CollectionEntryModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CollectionEntryModel.countDocuments(filter),
  ]);

  return {
    pokemon: entries.map((entry) => ({
      id: entry.pokemonId,
      name: entry.name,
      sprite: getSpriteUrl(entry.pokemonId),
      types: entry.types,
      addedAt: entry.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
