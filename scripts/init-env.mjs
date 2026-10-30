// Prepara la configuración de los dos modos de ejecución con un solo comando:
// - .env (raíz): lo lee docker compose. Solo lleva el JWT_SECRET
// - backend/.env y frontend/.env: para npm run dev, copiados de su .env.example
// Los JWT_SECRET se generan al azar (mismo método que indica el README), así
// nadie tiene que crearlos ni copiarlos a mano.
// Nunca sobrescribe nada: un archivo que ya existe no se toca, así no cambia
// ningún secreto ni se cierran las sesiones abiertas
import { randomBytes } from "node:crypto";
import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";

const root = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

function newSecret() {
  return randomBytes(48).toString("base64url");
}

// .env de la raíz: si ya existe sin JWT_SECRET, solo se añade al final
function initComposeEnv() {
  const path = root(".env");
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (/^JWT_SECRET=.+/m.test(current)) {
    console.log(".env (docker compose): ya existe, no se modifica");
    return;
  }
  const separator = current && !current.endsWith("\n") ? "\n" : "";
  appendFileSync(
    path,
    `${separator}# Solo para docker compose (generado por scripts/init-env.mjs).\n` +
      `# Para npm run dev se usa backend/.env. No se sube a git\n` +
      `JWT_SECRET=${newSecret()}\n`,
  );
  console.log(
    current
      ? ".env (docker compose): añadido un JWT_SECRET aleatorio"
      : ".env (docker compose): creado con un JWT_SECRET aleatorio",
  );
}

// Copia el .env.example de una carpeta, cambiando el JWT_SECRET de ejemplo
// por uno aleatorio si lo tiene
function initLocalEnv(folder) {
  const path = root(`${folder}/.env`);
  if (existsSync(path)) {
    console.log(`${folder}/.env (npm run dev): ya existe, no se modifica`);
    return;
  }
  const example = readFileSync(root(`${folder}/.env.example`), "utf8");
  const content = example.replace(
    /^JWT_SECRET=.*$/m,
    `JWT_SECRET=${newSecret()}`,
  );
  writeFileSync(path, content);
  console.log(`${folder}/.env (npm run dev): creado a partir de .env.example`);
}

initComposeEnv();
initLocalEnv("backend");
initLocalEnv("frontend");
