import type { Pagination, PokemonListItem } from "./pokemon.js";

export interface CollectionItem extends PokemonListItem {
  addedAt: string; // Fecha ISO en que se añadió a la colección
}

export interface CollectionPage {
  pokemon: CollectionItem[];
  pagination: Pagination;
}
