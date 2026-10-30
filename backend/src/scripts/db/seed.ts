import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { connectDB } from "../../config/db.js";
import { UserModel } from "../../models/User.js";
import { RefreshTokenModel } from "../../models/RefreshToken.js";
import { CollectionEntryModel } from "../../models/CollectionEntry.js";
import { registerSchema } from "../../validators/auth.validators.js";
import { registerUser } from "../../services/auth.service.js";
import { addToCollection } from "../../services/collection.service.js";

// Datos de prueba: usuarios con contraseña conocida y una colección cada uno.
// Se usan los mismos servicios que la aplicación, así que:
// - las contraseñas pasan las reglas del registro y se guardan con bcrypt
// - cada Pokémon se valida y su nombre y tipos se copian de PokéAPI, igual
//   que al pulsar "Capturar" (por eso necesita conexión a internet)
// Se puede ejecutar varias veces: solo borra y vuelve a crear sus propios
// usuarios (con sus colecciones y sesiones), nunca otros datos
const SEED_USERS = [
  {
    username: "ash",
    email: "ash@pokedex.test",
    password: "Pikachu#2026",
    // 25 Pokémon: más de una página (20 por página) para probar la paginación
    pokemonIds: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 16, 18, 19, 25, 26, 94, 95, 129, 130,
      131, 133, 143, 149, 150,
    ],
  },
  {
    username: "misty",
    email: "misty@pokedex.test",
    password: "Starmie#2026",
    // Casi todos de agua: para probar la búsqueda y el filtro por tipos
    pokemonIds: [7, 54, 55, 60, 116, 118, 120, 121, 129, 131],
  },
  {
    username: "red",
    email: "red@pokedex.test",
    password: "Charizard#2026",
    // 50 Pokémon (3 páginas) de los 18 tipos, varios con dos tipos, para
    // combinar paginación, búsqueda y filtros. Incluye nombres parecidos
    // ("char", "saur", "eon")
    pokemonIds: [
      1, 3, 4, 5, 6, 9, 12, 18, 24, 25, 26, 31, 34, 38, 39, 59, 65, 68, 76, 81,
      94, 95, 106, 112, 123, 124, 126, 130, 131, 134, 135, 136, 142, 143, 144,
      145, 146, 149, 150, 151, 181, 196, 197, 208, 212, 214, 227, 248, 249, 250,
    ],
  },
];

async function removeSeedUsers() {
  const users = await UserModel.find({
    username: { $in: SEED_USERS.map((u) => u.username) },
  });
  const ids = users.map((u) => u._id);
  await Promise.all([
    CollectionEntryModel.deleteMany({ user: { $in: ids } }),
    RefreshTokenModel.deleteMany({ user: { $in: ids } }),
  ]);
  await UserModel.deleteMany({ _id: { $in: ids } });
}

async function seed() {
  await connectDB(env.MONGO_URI);
  await removeSeedUsers();

  for (const { pokemonIds, ...credentials } of SEED_USERS) {
    const user = await registerUser(registerSchema.parse(credentials));
    await Promise.all(pokemonIds.map((id) => addToCollection(user.id, id)));
    console.log(
      `Usuario "${user.username}" creado con ${pokemonIds.length} Pokémon en su colección`,
    );
  }
}

seed()
  .then(() => {
    console.log("Datos de prueba cargados");
  })
  .catch((err: unknown) => {
    console.error("No se pudieron cargar los datos de prueba");
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
