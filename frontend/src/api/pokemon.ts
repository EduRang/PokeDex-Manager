import { api } from "./client";
import type {
  PokemonDetail,
  PokemonListParams,
  PokemonPage,
  PokemonSearchParams,
  PokemonType,
} from "../types/pokemon";

export async function getPokemonList(
  params: PokemonListParams,
): Promise<PokemonPage> {
  const { data } = await api.get<PokemonPage>("/pokemon", { params });
  return data;
}

export async function searchPokemon(
  params: PokemonSearchParams,
): Promise<PokemonPage> {
  const { data } = await api.get<PokemonPage>("/pokemon/search", { params });
  return data;
}

export async function getPokemonTypes(): Promise<PokemonType[]> {
  const { data } = await api.get<{ types: PokemonType[] }>("/pokemon/types");
  return data.types;
}

// Acepta número de Pokédex o nombre exacto
export async function getPokemonDetail(
  idOrName: string | number,
): Promise<PokemonDetail> {
  const { data } = await api.get<{ pokemon: PokemonDetail }>(
    `/pokemon/${encodeURIComponent(idOrName)}`,
  );
  return data.pokemon;
}
