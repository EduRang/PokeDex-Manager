import "dotenv/config";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

const api = express.Router();

app.use("/api", api);

api.get("/health", (__req, res) => {
  res.json({ status: "ok", message: "Hello from the PokeDex API" });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
