import { z } from "zod";

// Número de Pokédex o nombre
// Solo letras, números y guiones
export const pokemonIdParamSchema = z.object({
  id: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{1,50}$/, "Identificador de Pokémon inválido"),
});

export const pokemonListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe ser 1 o mayor")
    .default(1),
  limit: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Debe ser 1 o mayor")
    .max(50, "Debe ser 50 o menor")
    .default(20),
});
