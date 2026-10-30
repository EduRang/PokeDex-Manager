# PokéDex Manager

Aplicación web para explorar la Pokédex, con registro e inicio de sesión de usuarios. El backend actúa como proxy de [PokéAPI](https://pokeapi.co/) con caché, para no superar su límite de 100 solicitudes por minuto, y ofrece listado paginado de Pokémon, búsqueda por nombre, filtro por tipo y detalle. Cada usuario tiene además su colección personal de Pokémon, guardada en MongoDB.

En el frontend se puede recorrer la Pokédex página a página, buscar por nombre, filtrar por uno o dos tipos y abrir la ficha de cada Pokémon, con una interfaz inspirada en la Pokédex de Nintendo DS. Desde la ficha se captura un Pokémon para añadirlo a "Mi colección" o se libera para quitarlo, y la colección se puede recorrer, buscar y filtrar igual que la Pokédex.

## Índice

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Datos de prueba](#datos-de-prueba)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [API](#api)
- [Base de datos](#base-de-datos)
- [Decisiones técnicas](#decisiones-técnicas)
- [Pendiente y mejoras futuras](#pendiente-y-mejoras-futuras)

## Stack

| Capa            | Tecnología                          | Motivo                                                                               |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| Frontend        | React 19 + Vite + TypeScript        | Arranque rápido, recarga instantánea y tipado                                        |
| Estilos         | Tailwind CSS v4                     | Clases utilitarias directamente en los componentes, sin archivos CSS aparte          |
| Tipografía      | DotGothic16 + Pixelify Sans         | Fuentes pixeladas incluidas en el build con Fontsource, sin depender de Google Fonts |
| Enrutado        | React Router v7                     | Rutas protegidas y públicas declaradas en un solo lugar                              |
| HTTP (cliente)  | Axios                               | Interceptores para adjuntar el token y renovar la sesión automáticamente             |
| Avisos          | notistack                           | Cola de avisos flotantes con componente propio; no depende de Material UI            |
| Backend         | Node.js 22 + Express 5 + TypeScript | Express 5 propaga los errores de funciones `async` al manejador central              |
| Validación      | Zod 4 (mensajes en español)         | Un mismo esquema valida la entrada y genera el tipo de TypeScript                    |
| Base de datos   | MongoDB 8 + Mongoose                | Esquemas, índices únicos y expiración automática (TTL) de documentos                 |
| Autenticación   | JWT + refresh token rotativo        | Ver [Sesión y autenticación](#sesión-y-autenticación)                                |
| Caché           | lru-cache                           | Caché en memoria con TTL, límite de entradas y agrupación de solicitudes simultáneas |
| Infraestructura | Docker Compose + NGINX              | Toda la aplicación con un solo comando; NGINX sirve el frontend compilado            |

## Requisitos

- **Con Docker:** Docker Desktop. Node.js solo para el paso de configuración (o ver la alternativa más abajo).
- **En modo desarrollo:** Node.js 22 o superior y Docker Desktop para MongoDB (o una instancia propia de MongoDB).

## Instalación y ejecución

**1. Configuración** (una sola vez, desde la raíz; sirve para los dos modos):

```bash
node scripts/init-env.mjs
```

Crea los tres archivos `.env` con `JWT_SECRET` aleatorios: el de la raíz (lo lee `docker compose`), `backend/.env` y `frontend/.env` (para `npm run dev`, copiados de su `.env.example`). Nunca sobrescribe un archivo que ya existe. Sin Node instalado se puede ejecutar con la imagen de Node: `docker run --rm -v "$PWD:/app" -w /app node:22-alpine node scripts/init-env.mjs`.

**2. Elegir uno de los dos modos.** Cada uno tiene sus propios comandos, y no se pueden usar a la vez porque comparten puertos (frontend `http://localhost:5173`, API `http://localhost:5000`).

**Modo A: Docker** (toda la aplicación en contenedores, sin instalar dependencias). Todos los comandos, desde la raíz:

```bash
docker compose up --build -d                                # construir y arrancar
docker compose exec backend node dist/scripts/db/seed.js    # opcional: usuarios de prueba (comando de este modo)
docker compose logs -f backend                              # ver los logs del backend
docker compose down                                         # parar
```

Los datos se conservan en el volumen `mongo-data` al parar. `docker compose down -v` también los borra.

**Modo B: desarrollo** (`npm run dev`, recarga al guardar):

```bash
# Base de datos (desde la raíz)
docker compose up -d mongo

# Backend (http://localhost:5000)
cd backend
npm install
npm run db:seed           # opcional: usuarios de prueba (comando de este modo)
npm run dev

# Frontend (http://localhost:5173), en otra terminal
cd frontend
npm install
npm run dev
```

Para comprobar que el backend está conectado a la base de datos: `GET http://localhost:5000/api/health` debe responder `{"status":"ok","db":"conectada"}`.

Si se prefiere crear `backend/.env` a mano (copiando `.env.example`), el `JWT_SECRET` se puede generar con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Otros comandos (modo desarrollo)

| Carpeta  | Comando                       | Descripción                                      |
| -------- | ----------------------------- | ------------------------------------------------ |
| backend  | `npm run build` / `npm start` | Compila a `dist/` y ejecuta la versión compilada |
| backend  | `npm run typecheck`           | Comprueba los tipos sin compilar                 |
| backend  | `npm run db:seed`             | Carga los usuarios de prueba y sus colecciones   |
| backend  | `npm run db:clean`            | Vacía la base de datos (no en producción)        |
| backend  | `npm run db:reset`            | `db:clean` y después `db:seed`                   |
| frontend | `npm run build`               | Compila para producción                          |
| frontend | `npm run lint`                | Revisa el código con oxlint                      |

## Datos de prueba

Hay tres usuarios de prueba, cada uno con su colección de Pokémon, para probar la aplicación sin registrarse. Se cargan con un comando distinto según el modo:

| Modo           | Comando                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| A (Docker)     | `docker compose exec backend node dist/scripts/db/seed.js`, desde la raíz |
| B (desarrollo) | `npm run db:seed`, en `backend/`                                          |

Los dos hacen lo mismo. Dentro del contenedor no sirve `npm run db:seed` porque la imagen no incluye `tsx` ni el código fuente, solo el compilado.

| Usuario | Correo               | Contraseña       | Colección                                                                |
| ------- | -------------------- | ---------------- | ------------------------------------------------------------------------ |
| `red`   | `red@pokedex.test`   | `Charizard#2026` | 50 Pokémon de los 18 tipos (3 páginas): paginación, búsqueda y filtros   |
| `ash`   | `ash@pokedex.test`   | `Pikachu#2026`   | 25 Pokémon (2 páginas)                                                   |
| `misty` | `misty@pokedex.test` | `Starmie#2026`   | 10 Pokémon de tipo agua, algunos con un segundo tipo: búsqueda y filtros |

Se puede iniciar sesión con el usuario o con el correo. Algunas búsquedas para probar con `red`: `char` (Charmander, Charmeleon, Charizard), `eon` (Charmeleon y las evoluciones de Eevee) o los tipos fuego + volador (Charizard, Moltres, Ho-Oh).

- **Requisitos:** la base de datos en marcha (en el modo A, los contenedores; en el B, `docker compose up -d mongo`) y la configuración del paso 1. También necesita internet: cada Pokémon se añade con el mismo servicio que el botón "Capturar", que comprueba que existe y copia su nombre y tipos de PokéAPI.
- **Usa los servicios de la aplicación:** las contraseñas pasan las mismas reglas que el registro y se guardan con bcrypt, así que los datos de prueba son iguales a los que crearía un usuario.
- **Se puede repetir:** solo borra y vuelve a crear sus propios tres usuarios (con sus colecciones y sesiones). Los demás datos no se tocan.
- **Empezar de cero:** `npm run db:clean` vacía usuarios, sesiones y colecciones, y sincroniza los índices con los modelos (crea los que falten y borra los obsoletos), así la base de datos queda igual que recién creada. No vacía la base de datos entera para no perder los índices únicos ni el TTL mientras el servidor está en marcha. Se niega a ejecutarse con `NODE_ENV=production`, así que solo está disponible en el modo B (el contenedor funciona en modo producción). `npm run db:reset` lo combina con `db:seed`.

## Variables de entorno

### Backend (`backend/.env`)

El servidor valida estas variables al arrancar y no inicia si falta alguna obligatoria o tiene un formato inválido.

| Variable                    | Obligatoria | Por defecto                       | Descripción                                                                                                           |
| --------------------------- | ----------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `MONGO_URI`                 | Sí          | —                                 | Cadena de conexión de MongoDB                                                                                         |
| `JWT_SECRET`                | Sí          | —                                 | Clave para firmar los access tokens (mínimo 32 caracteres)                                                            |
| `CLIENT_URL`                | Sí          | —                                 | Origen del frontend permitido por CORS y en las rutas de autenticación                                                |
| `PORT`                      | No          | `5000`                            | Puerto del servidor                                                                                                   |
| `ACCESS_TOKEN_TTL_MINUTES`  | No          | `15`                              | Duración del access token                                                                                             |
| `REFRESH_TOKEN_TTL_MINUTES` | No          | `30`                              | Duración de la sesión sin actividad                                                                                   |
| `POKEAPI_BASE_URL`          | No          | `https://pokeapi.co/api/v2`       | URL base de PokéAPI                                                                                                   |
| `POKEAPI_SPRITES_URL`       | No          | Repositorio de sprites de PokéAPI | URL base de las imágenes de los Pokémon                                                                               |
| `COOKIE_SECURE`             | No          | `true`                            | La cookie de sesión solo viaja por HTTPS. `false` solo en local (`http://`); `.env.example` ya lo trae así            |
| `COOKIE_SAMESITE`           | No          | `strict`                          | `strict`, `lax` o `none`. `none` solo si frontend y backend están en dominios distintos, y exige `COOKIE_SECURE=true` |

### Frontend (`frontend/.env`)

| Variable       | Descripción                                  |
| -------------- | -------------------------------------------- |
| `VITE_API_URL` | URL del backend, ej. `http://localhost:5000` |

### Docker (`.env` de la raíz)

Los contenedores no leen `backend/.env` ni `frontend/.env`: tienen su propia configuración en `docker-compose.yml`, porque algunos valores son distintos dentro de Docker (por ejemplo, `MONGO_URI` apunta al servicio `mongo` y no a `localhost`).

| Variable     | Obligatoria | Descripción                                                                                          |
| ------------ | ----------- | ---------------------------------------------------------------------------------------------------- |
| `JWT_SECRET` | Sí          | Lo crea `node scripts/init-env.mjs`. Sin él, `docker compose` no arranca y dice qué comando ejecutar |

El resto de valores están en `docker-compose.yml` porque no son secretos y no dependen de cada máquina: `NODE_ENV=production`, `COOKIE_SECURE=false` (todo va por `http://localhost`), `COOKIE_SAMESITE=strict`, `CLIENT_URL` y `VITE_API_URL`.

## Estructura del proyecto

```
PokeDex-Manager/
├── docker-compose.yml       MongoDB 8 (con volumen persistente), backend y frontend
├── scripts/init-env.mjs     Crea los .env de los dos modos con JWT_SECRET aleatorios
├── backend/Dockerfile       Compila TypeScript y ejecuta solo el código compilado
├── frontend/Dockerfile      Compila con Vite y sirve los archivos estáticos con NGINX
├── frontend/nginx.conf      Rutas de la aplicación, caché de los assets y gzip
├── backend/src/
│   ├── server.ts            Configuración de Express y arranque
│   ├── config/              Variables de entorno (validadas con Zod) y conexión a MongoDB
│   ├── routes/              Definición de rutas
│   ├── controllers/         Leen la solicitud, llaman al servicio y responden
│   ├── services/            Lógica de negocio (auth, collection, pokemon, token)
│   ├── clients/             Cliente HTTP de PokéAPI con caché
│   ├── validators/          Esquemas Zod de entrada
│   ├── models/              Modelos de Mongoose (CollectionEntry, RefreshToken, User)
│   ├── middlewares/         requireAuth, manejo central de errores y 404
│   ├── errors/              HttpError y utilidades de errores de MongoDB
│   ├── scripts/db/          Scripts que se ejecutan aparte del servidor: datos de prueba y limpieza
│   └── types/               Contrato de la API y formas de las respuestas de PokéAPI
└── frontend/src/
    ├── api/                 Cliente Axios (token + renovación automática) y llamadas
    ├── context/, hooks/     Estado de la sesión, carga de datos (listado, ficha, colección, tipos) y filtros en la URL
    ├── pages/               Login, registro, listado de Pokémon, ficha de detalle y "Mi colección"
    ├── layouts/             Estructura de las pantallas públicas y privadas
    ├── components/          Tarjetas, filtros, paginación, ficha, campos de formulario, diálogos, etc.
    ├── types/               Tipos compartidos (mismo contrato que el backend)
    └── utils/               Validación de formularios, formato de nombres, números y medidas, y origen de la navegación
```

El backend sigue una arquitectura por capas: **rutas → controladores → servicios → clientes/modelos**. Los controladores no contienen lógica de negocio y los servicios no hablan con Express.

## API

Todas las rutas tienen el prefijo `/api`. Los errores siempre responden `{ "error": "mensaje" }`; los de validación añaden `details: [{ field, message }]`.

### Autenticación

| Método | Ruta                 | Auth   | Descripción                                                                                                 |
| ------ | -------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register` | —      | Crea un usuario. Body: `{ username, email, password }` → `201 { user }`                                     |
| POST   | `/api/auth/login`    | —      | Body: `{ identifier, password }` (correo o nombre de usuario) → `{ user, accessToken }` y cookie de refresh |
| POST   | `/api/auth/refresh`  | Cookie | Renueva la sesión → `{ user, accessToken }` y nueva cookie                                                  |
| POST   | `/api/auth/logout`   | Cookie | Revoca la sesión en el servidor → `204`                                                                     |
| GET    | `/api/auth/me`       | Bearer | Devuelve el usuario actual → `{ user }`                                                                     |

Reglas de validación:

- **Usuario:** 3–20 caracteres, con letras, números y `_`, sin espacios. Se guarda en minúsculas.
- **Contraseña:** 8–72 caracteres, con mayúscula, minúscula, número y carácter especial.

### Pokémon

Todas requieren `Authorization: Bearer <accessToken>`.

| Método | Ruta                                           | Descripción                                                                                           |
| ------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GET    | `/api/pokemon?page=&limit=&type=`              | Listado paginado. `page` ≥ 1 (por defecto 1), `limit` 1–50 (por defecto 20), `type` opcional          |
| GET    | `/api/pokemon/search?name=&page=&limit=&type=` | Búsqueda parcial por nombre, sin distinguir mayúsculas. Primero los que empiezan por el texto buscado |
| GET    | `/api/pokemon/types`                           | Tipos disponibles: `[{ name: "fire", label: "Fuego" }, …]`                                            |
| GET    | `/api/pokemon/:id`                             | Detalle por número de Pokédex o nombre exacto, con el Pokémon anterior y el siguiente                 |

**Filtro por tipo:** `type` acepta uno o dos tipos separados por coma: `?type=fire,flying` devuelve solo los Pokémon que son de fuego **y** volador (Charizard, Moltres, Ho-Oh…). El máximo es 2 porque ningún Pokémon tiene más de dos tipos.

Los tipos se indican por su nombre interno en inglés (`fire`), no por su etiqueta en español ("Fuego"). Los repetidos se ignoran (`fire,fire` equivale a `fire`). Un tipo desconocido responde `400` con `Tipo de Pokémon desconocido: <tipo>`, y más de dos tipos responde `400` con el error de validación.

Ejemplo de listado (`GET /api/pokemon?type=fire&limit=1`):

```json
{
  "pokemon": [
    {
      "id": 4,
      "name": "charmander",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
      "types": ["fire"]
    }
  ],
  "pagination": { "page": 1, "limit": 1, "total": 109, "totalPages": 109 }
}
```

Ejemplo de detalle (`GET /api/pokemon/25`):

```json
{
  "pokemon": {
    "id": 25,
    "name": "pikachu",
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
    "types": ["electric"],
    "stats": [
      { "name": "hp", "value": 35 },
      { "name": "attack", "value": 55 },
      "…"
    ],
    "heightMeters": 0.4,
    "weightKg": 6,
    "abilities": [
      { "name": "static", "label": "Electricidad Estática", "isHidden": false },
      { "name": "lightning-rod", "label": "Pararrayos", "isHidden": true }
    ]
  },
  "previous": { "id": 24, "name": "arbok", "sprite": "…/24.png" },
  "next": { "id": 26, "name": "raichu", "sprite": "…/26.png" },
  "inCollection": true
}
```

`previous` y `next` siguen el mismo orden que el listado: tras el #1025 continúan las formas alternativas (#10001 en adelante). Son `null` en el primero y el último.

`inCollection` indica si el Pokémon está en la colección del usuario que hace la solicitud. Va fuera de `pokemon` porque depende del usuario, no del Pokémon.

### Colección

Todas requieren `Authorization: Bearer <accessToken>`. Cada usuario solo ve y modifica su propia colección.

| Método | Ruta                                       | Descripción                                                                                       |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| GET    | `/api/collection?page=&limit=&name=&type=` | Colección paginada, en orden de Pokédex. Mismas reglas que la Pokédex; `name` y `type` opcionales |
| PUT    | `/api/collection/:pokemonId`               | Añade (captura) el Pokémon → `201` si se añadió, `204` si ya estaba, `404` si el número no existe |
| DELETE | `/api/collection/:pokemonId`               | Quita (libera) el Pokémon → `204`, también si no estaba                                           |

- **`:pokemonId`:** solo el número de Pokédex (`25`), no el nombre, porque es lo que se guarda. Debe ser un entero mayor que 0.
- **Idempotencia:** `PUT` y `DELETE` describen el estado final ("Pikachu está en mi colección" / "no está"), así que repetirlos no es un error. Un doble clic, dos pestañas abiertas o un reintento tras perder la respuesta no generan errores falsos.
- **Búsqueda y filtro:** `name` busca el texto en cualquier parte del nombre y `type` acepta hasta dos tipos (el Pokémon debe tener ambos), igual que en la Pokédex. Los resultados mantienen el orden de Pokédex.

Ejemplo (`GET /api/collection?type=fire&limit=2`):

```json
{
  "pokemon": [
    {
      "id": 4,
      "name": "charmander",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
      "types": ["fire"],
      "addedAt": "2025-08-05T18:30:12.512Z"
    },
    {
      "id": 6,
      "name": "charizard",
      "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
      "types": ["fire", "flying"],
      "addedAt": "2025-08-05T18:31:47.090Z"
    }
  ],
  "pagination": { "page": 1, "limit": 2, "total": 4, "totalPages": 2 }
}
```

### Otros

| Método | Ruta          | Descripción                                                                             |
| ------ | ------------- | --------------------------------------------------------------------------------------- |
| GET    | `/api/health` | Estado del servidor y de la base de datos (`200`, o `503` si MongoDB no está conectada) |

## Base de datos

MongoDB guarda solo los datos propios de la aplicación: usuarios, sesiones y colecciones. Los datos de los Pokémon vienen de PokéAPI y se cachean en memoria. Los índices los crea Mongoose al arrancar el servidor. Para cargar datos de prueba, ver [Datos de prueba](#datos-de-prueba).

### `users`

| Campo                    | Tipo   | Notas                                                             |
| ------------------------ | ------ | ----------------------------------------------------------------- |
| `username`               | String | Único, en minúsculas                                              |
| `email`                  | String | Único, en minúsculas                                              |
| `passwordHash`           | String | Hash bcrypt. Nunca se devuelve en las consultas (`select: false`) |
| `createdAt`, `updatedAt` | Date   | Automáticos (`timestamps`)                                        |

Índices: `username` único y `email` único.

### `refreshtokens`

| Campo       | Tipo     | Notas                                                               |
| ----------- | -------- | ------------------------------------------------------------------- |
| `tokenHash` | String   | SHA-256 del refresh token; el token original solo está en la cookie |
| `user`      | ObjectId | Referencia a `users`                                                |
| `expiresAt` | Date     | Fin de la sesión si no hay actividad                                |

Índices: `tokenHash` único y TTL sobre `expiresAt`, con el que MongoDB borra solas las sesiones vencidas.

### `collectionentries`

Un documento por cada Pokémon de la colección de un usuario.

| Campo                    | Tipo     | Notas                                                                 |
| ------------------------ | -------- | --------------------------------------------------------------------- |
| `user`                   | ObjectId | Referencia a `users`                                                  |
| `pokemonId`              | Number   | Número de Pokédex                                                     |
| `name`                   | String   | Copia del nombre en PokéAPI al capturarlo (ej. `charizard`)           |
| `types`                  | [String] | Copia de los tipos al capturarlo, en orden (ej. `["fire", "flying"]`) |
| `createdAt`, `updatedAt` | Date     | `createdAt` es la fecha de captura (`addedAt` en la API)              |

Índices: `{ user, pokemonId }` único. Impide que un Pokémon esté dos veces en la misma colección y sirve también para listarla en orden de Pokédex y paginada.

## Decisiones técnicas

### Sesión y autenticación

- **Access token (JWT, 15 min):** se envía como `Authorization: Bearer`. En el frontend se guarda solo en memoria, nunca en `localStorage`, para que un ataque XSS no pueda robarlo de forma persistente.
- **Refresh token (30 min de inactividad):**
  - Es un valor aleatorio opaco y viaja en una cookie `httpOnly` que JavaScript no puede leer, limitada a `/api/auth`.
  - Por defecto es `Secure` y `SameSite=Strict`: solo viaja por HTTPS y nunca en solicitudes que vengan de otro sitio. Se configura con `COOKIE_SECURE` y `COOKIE_SAMESITE`, no con `NODE_ENV`, así en local solo se relaja `Secure` (no hay HTTPS) y el resto de protecciones se mantienen.
  - En la base de datos se guarda solo su hash SHA-256, con un índice TTL que borra las sesiones vencidas.
  - Se rota en cada uso: cada renovación invalida el token anterior.
- **Renovación silenciosa:** al recargar la página o cuando una solicitud recibe un `401`, el cliente renueva la sesión una sola vez y reintenta. Si llegan varias solicitudes a la vez, comparten una única renovación.
- **Cierre de sesión real:** el logout borra la sesión en el servidor, no solo en el navegador.
- **Protección contra CSRF:**
  - El resto de la API se autentica con el access token en la cabecera `Authorization`, que el navegador nunca añade solo, así que otra web no puede usarlo.
  - Las rutas de `/api/auth` (las que usan la cookie) rechazan con `403` cualquier solicitud cuya cabecera `Origin` no sea `CLIENT_URL`. Las solicitudes sin `Origin` (curl, Postman) no vienen de un navegador y se aceptan.
- **Contraseñas:** se guardan con bcrypt y nunca se devuelven en las respuestas. Ante credenciales incorrectas, el login responde siempre el mismo mensaje genérico, para no revelar si el usuario existe.
- **Unicidad:** la garantizan los índices únicos de MongoDB, no una consulta previa, lo que evita condiciones de carrera entre registros simultáneos.

### Proxy de PokéAPI y caché

PokéAPI permite 100 solicitudes por minuto, así que el backend nunca pide lo mismo dos veces:

- **Índice completo en una sola solicitud:**
  - `GET /pokemon?limit=3000` trae los 1351 Pokémon (nombre y URL) en una única llamada. El listado, la búsqueda y la paginación se resuelven en memoria sobre ese índice.
  - PokéAPI no tiene búsqueda parcial (`/pokemon/{nombre}` exige el nombre exacto), por lo que el índice completo es necesario para la búsqueda parcial.
- **Tipos sin pedir el detalle de cada Pokémon:**
  - Cada `/type/{nombre}` devuelve todos los Pokémon de ese tipo. Con unas 20 llamadas se conocen los tipos de los 1351.
  - Los nombres de los tipos en español (ej. "Fuego") también vienen de PokéAPI.
- **Habilidades en español:** el detalle pide cada `/ability/{nombre}` (también cacheado) para obtener su nombre traducido (ej. "Perspicacia").
  - Si PokéAPI falla al pedir una habilidad, el detalle responde igual (`200`) con el identificador de PokéAPI como `label` (ej. `lightning-rod`), en vez de fallar entero. El fallo no se cachea, así que la siguiente solicitud vuelve a intentarlo.
  - Por eso el Pokémon se cachea sin las etiquetas y estas se añaden en cada respuesta: si se cacheara el resultado ya combinado, un solo fallo dejaría el nombre sin traducir durante 24 h.
- **Pokémon anterior y siguiente:** `previous` y `next` salen del índice completo que ya está en caché, así que no cuestan ninguna llamada extra a PokéAPI.
- **Idioma de los nombres:** tipos y habilidades usan el nombre oficial en español de Latinoamérica (`es-419`), que a veces difiere del de España (`es`): "Pelea" en vez de "Lucha", "Insecto" en vez de "Bicho". Si no existe se usa `es`, luego el inglés y, por último, el nombre interno de PokéAPI.
- **Sprites:** la URL de la imagen se construye a partir del id. El navegador la descarga directamente de GitHub, sin pasar por PokéAPI.
- **Caché (`lru-cache`):**
  - Las entradas duran 24 horas, con un máximo de 2000.
  - Se guarda el resultado ya transformado (unos 3 KB por Pokémon), no la respuesta cruda (unos 370 KB).
  - Los 404 también se cachean, para no repetir búsquedas de Pokémon que no existen.
  - Los errores 5xx y los tiempos de espera agotados (8 s) no se cachean y responden `502`.
- **Solicitudes simultáneas:** si llegan varias iguales a la vez, comparten una sola llamada a PokéAPI.
- **Datos desactualizados:** PokéAPI no ofrece notificaciones de cambios y sus datos cambian rara vez (sobre todo con juegos nuevos), así que un retraso de hasta 24 h es aceptable. Reiniciar el servidor vacía el caché.
- **Seguridad:** el parámetro `:id` solo acepta letras, números y guiones, para que nadie pueda usar el proxy para llamar a otras rutas de PokéAPI.
- **URLs de PokéAPI:** el frontend nunca llama a PokéAPI directamente. La `url` que devuelve PokéAPI se transforma en `id` y `sprite`, y el detalle se pide a nuestro backend.

### Colección personal

- **Copia del nombre y los tipos:** al capturar un Pokémon se guardan su nombre y sus tipos, tomados del índice y de los tipos que ya están en caché (sin llamadas extra a PokéAPI). Así la colección se lee solo desde MongoDB y sigue funcionando aunque PokéAPI no responda o el caché esté vacío tras reiniciar el servidor. Nombres y tipos casi nunca cambian, así que la copia no se queda desactualizada en la práctica.
- **El sprite no se guarda:** se construye a partir del número con `POKEAPI_SPRITES_URL`. Esa URL base viene de la configuración y puede cambiar, así que guardar la URL completa sería frágil.
- **Sin duplicados ni condiciones de carrera:** capturar intenta insertar directamente y el índice único `{ user, pokemonId }` rechaza el duplicado, igual que con los usuarios. Dos solicitudes simultáneas no pueden añadir el mismo Pokémon dos veces.
- **Validación:** antes de añadir un Pokémon se comprueba que su número existe en PokéAPI (`404` si no), para que nadie pueda guardar `#99999`.
- **Orden de Pokédex:** la colección se lista por número, como en los juegos, y no por fecha de captura. La base de datos hace la paginación (`sort`, `skip`, `limit` y `countDocuments`) con el mismo índice único.
- **Búsqueda en MongoDB:** el nombre se busca con `$regex`. El texto del usuario se escapa antes, para que caracteres como `.` o `*` se busquen literalmente y nadie pueda enviar un patrón costoso. El filtro por tipos usa `$all`.
- **Estado en la ficha:** `GET /api/pokemon/:id` incluye `inCollection`, consultado a la vez que el Pokémon anterior y el siguiente, así la ficha sabe el estado del botón sin otra solicitud.

### Interfaz (frontend)

- **Diseño:** inspirado en las Pokédex de Nintendo DS, sin usar recursos del juego. La Poké Ball, la Super Ball y el lápiz son pixel art propio en SVG y los marcos, etiquetas de tipo y formas inclinadas son CSS.
- **Paleta (regla 60-30-10):** celeste para el fondo y la información, azul marino para los marcos, gris carbón para los botones (todo lo que se pulsa) y rojo solo como acento (barra superior, foco y Poké Ball).
- **Accesibilidad:**
  - Contraste WCAG AA comprobado en todos los textos, incluidas las etiquetas de tipo.
  - Foco de teclado visible en cualquier fondo (anillo blanco y contorno rojo).
  - Sin animaciones si el sistema pide reducir movimiento.
  - Objetivos táctiles de al menos 24 px y texto real en lugar de imágenes de texto. Por eso las etiquetas de tipo son propias y no los iconos de PokéAPI, que además solo están en inglés.
- **Tipografía:** DotGothic16 está dibujada sobre una cuadrícula de 16 px, así que se usa a 16 o 32 px para que se vea nítida. La única excepción es el título de la barra superior en móvil, a 18 px: es lo más grande que cabe junto a "Cerrar sesión" en una pantalla de 360 px. Pixelify Sans se usa solo en las etiquetas de tipo.
- **Barra superior:** el nombre de usuario aparece como una ficha de entrenador ("ENTRENADOR | nombre") con una Super Ball. En móvil solo se ve la Super Ball; al pulsarla, el nombre aparece en una burbuja.
- **Navegación:** pestañas "Pokédex" y "Mi colección" bajo la barra superior. La pestaña activa tiene el color del fondo de la página, como una carpeta abierta.
- **Capturar y liberar:** en la esquina del recuadro del sprite.
  - Sin capturar: botón "Capturar" con una Poké Ball que se balancea al pasar el ratón y mientras se guarda.
  - Capturado: la Poké Ball en celeste (estado) junto al botón "Liberar" (acción). Liberar pide confirmación.
  - El estado cambia cuando el servidor confirma, no antes, para no mostrar algo que no se guardó.
  - Desde tablet la ficha está inclinada y el botón se desplaza según el número de filas de datos. Su posición se compensa para que quede siempre a la misma distancia del borde.
- **Mi colección:** misma cuadrícula, paginación, búsqueda y filtro por tipos que la Pokédex (comparten el hook `useListFilters`).
  - Si la página pedida queda vacía (por ejemplo, tras liberar el último Pokémon de la última página), se redirige a la nueva última página.
  - Al abrir una ficha desde la colección, el botón dice "Volver a mi colección" y la pestaña activa es "Mi colección". El origen viaja en el estado de navegación de React Router y se conserva al pasar al Pokémon anterior o siguiente.
- **Paginación:**
  - Números de página con huecos (`1 … 5 6 [7] 8 9 … 68`), siempre con la primera y la última, y botones de primera, anterior, siguiente y última página. La barra tiene siempre la misma cantidad de elementos, así no cambia de ancho al avanzar. En móvil se reduce a `1 … [7] … 68`.
  - "Página [7] de 68" permite escribir un número y saltar con Enter o con "Ir", que solo se habilita mientras se edita. El campo acepta solo dígitos; 0 lleva a la primera página y un número mayor que el total, a la última. Salir del campo sin confirmar lo devuelve a la página actual.
- **Estado en la URL:** página, búsqueda y tipos viven en la URL (`?name=char&type=fire,flying&page=2`), así recargar, volver atrás o compartir el enlace conserva los filtros.
  - La búsqueda espera 300 ms tras la última tecla antes de pedir resultados.
  - Mientras se escribe, se reemplaza la entrada del historial en vez de añadir una por letra.
- **Volver al listado:** las páginas ya vistas y la lista de tipos se guardan en memoria. Al volver desde la ficha, el listado aparece al instante y `ScrollRestoration` (React Router) devuelve al usuario a la tarjeta que abrió.
  - "Mi colección" usa un caché igual, pero se vacía al capturar o liberar un Pokémon y al cerrarse la sesión: si no, mostraría por un momento un Pokémon ya liberado o la colección del usuario anterior. Una respuesta pedida antes de vaciarlo tampoco se guarda.
- **Carga de datos:** hooks propios con `useEffect` que ignoran respuestas obsoletas y mantienen visibles los datos anteriores mientras cargan los nuevos.
- **Errores:** cada uno se muestra donde ayuda a resolverlo.
  - Acciones sin un sitio fijo en la pantalla (iniciar sesión o registrarse sin conexión, capturar, liberar): aviso flotante abajo en el centro, con notistack y un componente propio. Como mucho 3 a la vez, sin repetir el mismo mensaje, y se cierran solos a los 6 s o con su botón.
  - Datos incorrectos del formulario (usuario o contraseña incorrectos, usuario ya registrado): en el propio formulario, porque es lo que hay que corregir.
  - Cargas fallidas (Pokédex, colección, ficha): en lugar del contenido, con "Reintentar".
- **Ficha del Pokémon:** desde tablet, todo el interior va inclinado con una sola transformación, para que las diagonales sean continuas, y el texto se endereza para leerse bien. En móvil la ficha es recta.
- **Formato regional:** las medidas usan el formato numérico de México (`0.4 m`, `90.5 kg`) y la página declara `lang="es-MX"`.

### Docker

- **Imágenes en dos etapas:** una compila (TypeScript o Vite) y la final solo lleva el resultado. El backend incluye las dependencias de producción y `dist/`, sin código fuente ni herramientas de desarrollo; el frontend es NGINX con los archivos estáticos, sin Node.
- **Sin root:** el backend se ejecuta con el usuario `node` y el frontend con la variante oficial de NGINX sin privilegios (`nginx-unprivileged`).
- **Sin secretos en las imágenes:** los `.dockerignore` excluyen los `.env`. El `JWT_SECRET` llega al ejecutar, desde el `.env` de la raíz, y `docker compose` no arranca si falta.
- **`VITE_API_URL` al compilar:** Vite escribe la URL del backend en el código, así que es un argumento de construcción obligatorio. Sin él la construcción falla, en lugar de producir una imagen que apunte a una URL equivocada.
- **Rutas de la aplicación:** NGINX devuelve `index.html` en cualquier ruta (`/collection`, `/pokemon/25`) para que recargar no dé 404. Los archivos de `assets/`, que llevan un hash en el nombre, se cachean un año; `index.html`, nunca.
- **Orden de arranque:** MongoDB tiene un healthcheck y el backend espera a que responda, porque sin base de datos no arranca.
- **Modo producción en local:** el backend se ejecuta con `NODE_ENV=production` y solo relaja `COOKIE_SECURE`, porque en local todo va por `http://`. Por eso la limpieza de la base de datos se niega a ejecutarse dentro del contenedor.
- **Configuración fija:** los valores de `docker-compose.yml` que no son secretos no son variables, porque los decide el propio archivo (por ejemplo, `MONGO_URI` usa el nombre del servicio `mongo`) o coinciden con el modo de desarrollo (los puertos). Cambiar un puerto implica editar también la URL que depende de él (`CLIENT_URL` o `VITE_API_URL`).

### Otras decisiones

- **Prefijo `/api`:** todas las rutas (incluidas las de autenticación) cuelgan de `/api`, para separar claramente la API de cualquier otra ruta y facilitar un proxy inverso.
- **Idioma:** los textos visibles para el usuario, los mensajes de error, los logs y los comentarios están en español. Los nombres de variables, funciones, archivos y campos de la API están en inglés, por convención.
- **Sin capa de repositorio:** los servicios usan los modelos de Mongoose directamente. Con tres colecciones, una capa extra añadiría código sin beneficio real.
- **Despliegue en dominios separados:**
  - El backend permite CORS con credenciales solo desde `CLIENT_URL`.
  - Lo recomendable es servir frontend y backend bajo el mismo sitio (ej. `app.dominio.com` y `api.dominio.com`, o un proxy inverso): así la cookie puede seguir con `SameSite=Strict`.
  - Si están en dominios distintos (ej. Vercel y Heroku), hace falta `COOKIE_SAMESITE=none`, que exige HTTPS (`COOKIE_SECURE=true`). La comprobación de `Origin` sigue protegiendo contra CSRF, pero algunos navegadores bloquean las cookies de terceros.

## Pendiente y mejoras futuras

Todas las funcionalidades obligatorias de la prueba están implementadas. Esta sección recoge los puntos opcionales que faltan y las mejoras que haría con más tiempo y cómo las implementaría.

### Bonificaciones pendientes

- **Pruebas:** `vitest` y `supertest` (backend) y Testing Library (frontend) ya están instalados, pero todavía no hay pruebas (`npm test` del backend falla porque no encuentra ninguna).
  - Separar `server.ts` en `app.ts` (crea la aplicación de Express) y `server.ts` (conecta y escucha), para probar la API con `supertest` sin levantar el servidor.
  - Unitarias: validadores (tipos combinados, `pokemonId`), `toLocalizedName`, el escape del texto de búsqueda y el cálculo de los números de la paginación.
  - Frontend: los hooks (ej. `useListFilters`, el caché de `useCollection`) y los componentes con interacción (paginación, botón de capturar).
- **Despliegue:**
  - Base de datos en MongoDB Atlas (plan gratuito).
  - Backend con su `Dockerfile` en Render, con `COOKIE_SECURE=true` y `CLIENT_URL` con el dominio del frontend.
  - Frontend en Vercel, con una regla de reescritura que envíe `/api/*` al backend. Así el navegador ve un solo dominio: la cookie mantiene `SameSite=Strict`, no hace falta CORS y se evita el bloqueo de cookies de terceros de Safari y Chrome. `VITE_API_URL` quedaría vacío, para que el frontend llame a `/api` en su propio dominio.
  - Datos de prueba: ejecutar el seed desde local con `MONGO_URI` apuntando a Atlas.
- **PWA (aplicación instalable):** un manifiesto web (nombre, colores e iconos a partir de la Poké Ball) para poder instalarla en el móvil o el escritorio.
- **Colección de Postman:** con todas las rutas, los usuarios de prueba y un script que guarde el access token al iniciar sesión para usarlo en el resto de solicitudes.
- **Capturas de pantalla:** una sección en el README con capturas del inicio de sesión, la Pokédex con filtros, la ficha de un Pokémon y "Mi colección", en escritorio y en móvil.

### Mejoras

**Seguridad**

- **Límite de intentos:** hoy no hay límite de solicitudes, así que se podrían probar contraseñas sin freno. Con `express-rate-limit` en `/api/auth/login` y `/api/auth/register` (por ejemplo, 10 intentos cada 15 minutos por IP), respondiendo `429`.

**Funcionalidad**

- **Gestión de la colección:** apodos y notas para cada Pokémon capturado, y ordenar también por fecha de captura (la API ya devuelve `addedAt`).
- **Filtro por tipo en la colección:** ofrecer solo los tipos que hay en la colección del usuario, no los 18.
- **Cuenta:** cambiar la contraseña y eliminar la cuenta, con sus colecciones y sesiones.

**Funcionalidades creativas**

- **Progreso de la Pokédex:** "Has capturado 45 de 151 Pokémon de Kanto", con una barra por región como las de las estadísticas. Se calcula con los números de Pokédex de la colección y el rango de números de cada generación.
- **Cadena evolutiva en la ficha:** las evoluciones del Pokémon (PokéAPI las da), marcando cuáles ya están capturadas y con enlace a su ficha.
- **Equipo Pokémon:** elegir hasta 6 de la colección y ver la cobertura de tipos del equipo, es decir, a qué tipos es débil o resistente, con las relaciones de daño que PokéAPI da para cada tipo.
- **Sonidos:** música de fondo de estilo videojuego, desactivada por defecto, con un botón para activarla, pausarla o cambiar de canción. En la ficha, un botón para reproducir el grito del Pokémon (PokéAPI incluye el de cada uno).

**DevOps**

- **Integración continua:** GitHub Actions que ejecute lint, build y pruebas en cada pull request.
- **Logs estructurados:** `pino` en lugar de `console`, con un identificador por solicitud, para poder buscarlos y filtrarlos en producción.
