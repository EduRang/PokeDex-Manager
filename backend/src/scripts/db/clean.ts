import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { connectDB } from "../../config/db.js";
import { UserModel } from "../../models/User.js";
import { RefreshTokenModel } from "../../models/RefreshToken.js";
import { CollectionEntryModel } from "../../models/CollectionEntry.js";

// Deja la base de datos como recién creada: sin datos y con los índices
// exactamente iguales a los modelos actuales. Sirve para empezar de cero en
// desarrollo (db:reset lo combina con db:seed).
// - deleteMany vacía usuarios, sesiones y colecciones de Pokémon.
// - syncIndexes crea los índices que falten y borra los que ya no están en el
//   código (de versiones anteriores del esquema).
// No se borra la base de datos entera: los índices únicos y el TTL dejarían
// de existir hasta reiniciar el servidor, que los crea solo al arrancar.
// Nunca se ejecuta en producción: borraría a todos los usuarios reales
async function clean() {
  if (env.NODE_ENV === "production") {
    throw new Error("No se permite vaciar la base de datos en producción");
  }

  await connectDB(env.MONGO_URI);

  const [collections, sessions, users] = await Promise.all([
    CollectionEntryModel.deleteMany({}),
    RefreshTokenModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);

  console.log(
    `Borrados: ${users.deletedCount} usuarios, ${sessions.deletedCount} sesiones y ${collections.deletedCount} Pokémon de colecciones`,
  );

  // Devuelve los nombres de los índices que eliminó
  const dropped = (
    await Promise.all([
      CollectionEntryModel.syncIndexes(),
      RefreshTokenModel.syncIndexes(),
      UserModel.syncIndexes(),
    ])
  ).flat();
  console.log(
    dropped.length > 0
      ? `Índices sincronizados. Eliminados por obsoletos: ${dropped.join(", ")}`
      : "Índices sincronizados, no había obsoletos",
  );
}

clean()
  .then(() => {
    console.log("Base de datos vacía");
  })
  .catch((err: unknown) => {
    console.error("No se pudo vaciar la base de datos");
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
