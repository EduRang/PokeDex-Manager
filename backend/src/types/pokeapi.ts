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

export interface PokeApiType {
  name: string;
  names: { name: string; language: NamedResource }[];
  pokemon: { slot: number; pokemon: NamedResource }[];
}
