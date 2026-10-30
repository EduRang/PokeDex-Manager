import { z } from "zod";
import {
  pokemonListQuerySchema,
  pokemonSearchQuerySchema,
} from "./pokemon.validators.js";

// Mismas reglas que el listado y la búsqueda de la Pokédex (página, límite,
// hasta 2 tipos y nombre), pero el nombre es opcional, sin él se lista todo
export const collectionListQuerySchema = pokemonListQuerySchema.extend({
  name: pokemonSearchQuerySchema.shape.name.optional(),
});

// Solo el número de Pokédex (no el nombre): es lo que se guarda en la colección
export const collectionPokemonParamSchema = z.object({
  pokemonId: z
    .string()
    .regex(/^\d{1,6}$/, "Debe ser un número de Pokédex")
    .transform(Number)
    .pipe(z.number().min(1, "Debe ser 1 o mayor")),
});
