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
  // Uno o dos tipos separados por coma (?type=fire,flying).
  // Vacío equivale a "todos los tipos". Solo se comparan con la lista de tipos
  // conocidos, nunca se usan en una URL de PokéAPI
  type: z
    .string()
    .toLowerCase()
    .optional()
    .transform((value) => [
      ...new Set(
        (value ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ])
    .pipe(
      z
        .array(z.string().regex(/^[a-z-]{1,20}$/, "Tipo de Pokémon inválido"))
        // Un Pokémon tiene como mucho 2 tipos
        // Con 3 o más nunca habría resultados
        .max(2, "Se pueden combinar como máximo 2 tipos"),
    ),
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
