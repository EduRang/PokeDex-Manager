import { Schema, model, type InferSchemaType } from "mongoose";

// Un Pokémon en la colección de un usuario.
// Nombre y tipos son una copia de PokéAPI tomada al añadirlo, así la colección
// se lee solo desde MongoDB aunque PokéAPI no responda.
// El sprite no se guarda: se construye a partir del id con POKEAPI_SPRITES_URL.
// Esa URL base viene de .env y puede cambiar, así que guardar la URL completa
// sería frágil.
const collectionEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pokemonId: {
      type: Number,
      required: true,
      min: 1,
    },
    name: {
      type: String,
      required: true,
    },
    types: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true },
);

// Un mismo Pokémon no puede estar dos veces en la colección de un usuario
collectionEntrySchema.index({ user: 1, pokemonId: 1 }, { unique: true });
// Listado de la colección: del más reciente al más antiguo, paginado
collectionEntrySchema.index({ user: 1, createdAt: -1 });

export type CollectionEntry = InferSchemaType<typeof collectionEntrySchema>;

export const CollectionEntryModel = model(
  "CollectionEntry",
  collectionEntrySchema,
);
