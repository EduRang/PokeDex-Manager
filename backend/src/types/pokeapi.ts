// Solo los campos de PokéAPI que usamos; sus respuestas traen muchos más

interface NamedResource {
  name: string;
  url: string;
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  height: number; // decímetros
  weight: number; // hectogramos
  sprites: { front_default: string | null };
  types: { slot: number; type: NamedResource }[];
  stats: { base_stat: number; stat: NamedResource }[];
  abilities: { is_hidden: boolean; slot: number; ability: NamedResource }[];
}

export interface PokeApiResourceList {
  count: number;
  results: NamedResource[];
}

// Nombre traducido a un idioma ("es-419", "es", "en"...)
export interface PokeApiLocalizedName {
  name: string;
  language: NamedResource;
}

export interface PokeApiType {
  name: string;
  names: PokeApiLocalizedName[];
  pokemon: { slot: number; pokemon: NamedResource }[];
}

export interface PokeApiAbility {
  name: string;
  names: PokeApiLocalizedName[];
}
