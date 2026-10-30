// Mismo contrato que backend

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonAbility {
  name: string;
  label: string;
  isHidden: boolean;
}

export interface PokemonDetail {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
  stats: PokemonStat[];
  heightMeters: number;
  weightKg: number;
  abilities: PokemonAbility[];
}

export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export interface PokemonNeighbor {
  id: number;
  name: string;
  sprite: string;
}

export interface PokemonDetailResponse {
  pokemon: PokemonDetail;
  previous: PokemonNeighbor | null;
  next: PokemonNeighbor | null;
  inCollection: boolean; // Si está en la colección del usuario
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PokemonPage {
  pokemon: PokemonListItem[];
  pagination: Pagination;
}

export interface PokemonType {
  name: string; // Se usa para filtrar: "fire"
  label: string; // Se muestra en la interfaz: "Fuego"
}

export interface PokemonListParams {
  page?: number;
  limit?: number;
  type?: string;
}

export interface PokemonSearchParams extends PokemonListParams {
  name: string;
}
