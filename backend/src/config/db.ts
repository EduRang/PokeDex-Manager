import mongoose from "mongoose";

/**
 * Connects to MongoDB. Fails fast (rejects after a few seconds) instead of
 * letting the server start without a database.
 */
export async function connectDB(uri: string): Promise<void> {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(
    `MongoDB connected: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`,
  );

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err.message);
  });
}
