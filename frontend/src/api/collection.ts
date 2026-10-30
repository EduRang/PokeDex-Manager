import { api } from "./client";
import type { CollectionListParams, CollectionPage } from "../types/collection";

export async function getCollection(
  params: CollectionListParams,
): Promise<CollectionPage> {
  const { data } = await api.get<CollectionPage>("/collection", { params });
  return data;
}

// Añadir uno que ya estaba o quitar uno que no estaba no es un error
export async function addToCollection(pokemonId: number): Promise<void> {
  await api.put(`/collection/${pokemonId}`);
}

export async function removeFromCollection(pokemonId: number): Promise<void> {
  await api.delete(`/collection/${pokemonId}`);
}
