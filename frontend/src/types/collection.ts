// Mismo contrato que backend
import type { Pagination, PokemonListItem } from "./pokemon";

export interface CollectionItem extends PokemonListItem {
  addedAt: string; // Fecha ISO en que se añadió a la colección
}

export interface CollectionPage {
  pokemon: CollectionItem[];
  pagination: Pagination;
}

export interface CollectionListParams {
  page?: number;
  limit?: number;
}
