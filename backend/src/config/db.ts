import mongoose from "mongoose";

/**
 * Conecta a MongoDB. Falla rápido (rechaza tras unos segundos) en lugar de
 * dejar que el servidor arranque sin base de datos
 */
export async function connectDB(uri: string): Promise<void> {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(
    `MongoDB conectado: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`,
  );

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB desconectado");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Error de MongoDB:", err.message);
  });
}
