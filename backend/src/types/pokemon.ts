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

export interface PokemonSummary {
  id: number;
  name: string;
  sprite: string;
}

export interface PokemonListItem extends PokemonSummary {
  types: string[];
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

export interface PokemonNeighbors {
  previous: PokemonSummary | null;
  next: PokemonSummary | null;
}
