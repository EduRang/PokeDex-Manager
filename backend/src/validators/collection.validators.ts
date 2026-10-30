import { z } from "zod";

// Solo el número de Pokédex (no el nombre): es lo que se guarda en la colección
export const collectionPokemonParamSchema = z.object({
  pokemonId: z
    .string()
    .regex(/^\d{1,6}$/, "Debe ser un número de Pokédex")
    .transform(Number)
    .pipe(z.number().min(1, "Debe ser 1 o mayor")),
});
