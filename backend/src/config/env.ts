import "dotenv/config";
import "./zod.js";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().min(1, "Es obligatorio"),
  CLIENT_URL: z.url("Debe ser una URL válida"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  POKEAPI_BASE_URL: z
    .url("Debe ser una URL válida")
    .default("https://pokeapi.co/api/v2"),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),
});

const parsed = envSchema.safeParse(process.env);

// Falla rápido: el servidor no debe arrancar con configuración faltante o inválida
if (!parsed.success) {
  console.error(
    "Variables de entorno inválidas en backend/.env (ver .env.example):",
  );
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
