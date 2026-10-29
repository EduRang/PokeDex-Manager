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
  // Vacío equivale a "todos los tipos". Solo se compara con la lista de tipos
  // conocidos, nunca se usa en una URL de PokéAPI
  type: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z-]{0,20}$/, "Tipo de Pokémon inválido")
    .optional(),
});

// El nombre no se usa en ninguna URL de PokéAPI (se filtra en memoria),
// así que basta con limitar la longitud
export const pokemonSearchQuerySchema = pokemonListQuerySchema.extend({
  name: z
    .string("Es obligatorio")
    .trim()
    .toLowerCase()
    .min(1, "Es obligatorio")
    .max(50, "Debe tener 50 caracteres o menos")
    // PokéAPI usa guiones en vez de espacios: "mr mime" -> "mr-mime"
    .transform((name) => name.replace(/\s+/g, "-")),
});
