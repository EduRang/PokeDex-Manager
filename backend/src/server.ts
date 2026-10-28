import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler, routeNotFound } from "./middlewares/errorHandler.js";

const app = express();

// Solo el origen del frontend puede llamar a la API desde el navegador
// credentials permite que el navegador envíe la cookie del refresh token
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const api = express.Router();

app.use("/api", api);

api.get("/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degradado",
    db: dbConnected ? "conectada" : "desconectada",
  });
});

api.use("/auth", authRoutes);

app.use(routeNotFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDB(env.MONGO_URI);
  } catch (err) {
    console.error(
      "No se pudo conectar a MongoDB. Revisa MONGO_URI en backend/.env",
    );
    console.error(
      "¿Está en ejecución? Prueba `docker compose up -d` desde la raíz del proyecto.",
    );
    console.error((err as Error).message);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${env.PORT}`);
  });
}

start();
