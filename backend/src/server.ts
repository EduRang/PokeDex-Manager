import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler, routeNotFound } from "./middlewares/errorHandler.js";

const app = express();

// Only the frontend origin is allowed to call the API from the browser
// Credentials lets the browser send the refresh token cookie
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const api = express.Router();

app.use("/api", api);

api.get("/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    db: dbConnected ? "connected" : "disconnected",
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
      "Could not connect to MongoDB. Check MONGO_URI in backend/.env",
    );
    console.error(
      "Is it running? Try `docker compose up -d` from the project root.",
    );
    console.error((err as Error).message);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });
}

start();
