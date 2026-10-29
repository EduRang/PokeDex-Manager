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
