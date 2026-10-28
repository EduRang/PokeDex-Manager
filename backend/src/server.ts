import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler, routeNotFound } from "./middlewares/errorHandler.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL;

// Only the frontend origin is allowed to call the API from the browser
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

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
  if (!MONGO_URI || !CLIENT_URL) {
    console.error(
      "Missing MONGO_URI or CLIENT_URL in backend/.env (see .env.example)",
    );
    process.exit(1);
  }

  try {
    await connectDB(MONGO_URI);
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

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();
