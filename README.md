# PokéDex Manager

Aplicación web para explorar la Pokédex, con registro e inicio de sesión de usuarios. El backend actúa como proxy de [PokéAPI](https://pokeapi.co/) con caché, para no superar su límite de 100 solicitudes por minuto, y ofrece listado paginado de Pokémon, búsqueda por nombre, filtro por tipo y detalle.

## Índice

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [API](#api)
- [Decisiones técnicas](#decisiones-técnicas)

## Stack

| Capa            | Tecnología                          | Motivo                                                                               |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------------------ |
| Frontend        | React 19 + Vite + TypeScript        | Arranque rápido, recarga instantánea y tipado                                        |
| Estilos         | Tailwind CSS v4                     | Clases utilitarias directamente en los componentes, sin archivos CSS aparte          |
| Enrutado        | React Router v7                     | Rutas protegidas y públicas declaradas en un solo lugar                              |
| HTTP (cliente)  | Axios                               | Interceptores para adjuntar el token y renovar la sesión automáticamente             |
| Backend         | Node.js 22 + Express 5 + TypeScript | Express 5 propaga los errores de funciones `async` al manejador central              |
| Validación      | Zod 4 (mensajes en español)         | Un mismo esquema valida la entrada y genera el tipo de TypeScript                    |
| Base de datos   | MongoDB 8 + Mongoose                | Esquemas, índices únicos y expiración automática (TTL) de documentos                 |
| Autenticación   | JWT + refresh token rotativo        | Ver [Sesión y autenticación](#sesión-y-autenticación)                                |
| Caché           | lru-cache                           | Caché en memoria con TTL, límite de entradas y agrupación de solicitudes simultáneas |
| Infraestructura | Docker Compose                      | Levanta MongoDB con un solo comando                                                  |

## Requisitos

- Node.js 22 o superior
- Docker Desktop (para MongoDB), o una instancia propia de MongoDB

## Instalación y ejecución

```bash
# 1. Base de datos (desde la raíz del proyecto)
docker compose up -d

# 2. Backend (http://localhost:5000)
cd backend
cp .env.example .env      # y cambiar JWT_SECRET por una cadena aleatoria larga
npm install
npm run dev

# 3. Frontend (http://localhost:5173), en otra terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

Para comprobar que el backend está conectado a la base de datos: `GET http://localhost:5000/api/health` debe responder `{"status":"ok","db":"conectada"}`.

Generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Otros comandos

| Carpeta  | Comando                       | Descripción                                      |
| -------- | ----------------------------- | ------------------------------------------------ |
| backend  | `npm run build` / `npm start` | Compila a `dist/` y ejecuta la versión compilada |
| backend  | `npm run typecheck`           | Comprueba los tipos sin compilar                 |
| frontend | `npm run build`               | Compila para producción                          |
| frontend | `npm run lint`                | Revisa el código con oxlint                      |

## Variables de entorno

### Backend (`backend/.env`)

El servidor valida estas variables al arrancar y no inicia si falta alguna obligatoria o tiene un formato inválido.

| Variable                    | Obligatoria | Por defecto                       | Descripción                                                |
| --------------------------- | ----------- | --------------------------------- | ---------------------------------------------------------- |
| `MONGO_URI`                 | Sí          | —                                 | Cadena de conexión de MongoDB                              |
| `JWT_SECRET`                | Sí          | —                                 | Clave para firmar los access tokens (mínimo 32 caracteres) |
| `CLIENT_URL`                | Sí          | —                                 | Origen del frontend permitido por CORS                     |
| `PORT`                      | No          | `5000`                            | Puerto del servidor                                        |
| `ACCESS_TOKEN_TTL_MINUTES`  | No          | `15`                              | Duración del access token                                  |
| `REFRESH_TOKEN_TTL_MINUTES` | No          | `30`                              | Duración de la sesión sin actividad                        |
| `POKEAPI_BASE_URL`          | No          | `https://pokeapi.co/api/v2`       | URL base de PokéAPI                                        |
| `POKEAPI_SPRITES_URL`       | No          | Repositorio de sprites de PokéAPI | URL base de las imágenes de los Pokémon                    |

### Frontend (`frontend/.env`)

| Variable       | Descripción                                  |
| -------------- | -------------------------------------------- |
| `VITE_API_URL` | URL del backend, ej. `http://localhost:5000` |

## Estructura del proyecto

```
PokeDex-Manager/
├── docker-compose.yml       MongoDB 8 con volumen persistente
├── backend/src/
│   ├── server.ts            Configuración de Express y arranque
│   ├── config/              Variables de entorno (validadas con Zod) y conexión a MongoDB
│   ├── routes/              Definición de rutas
│   ├── controllers/         Leen la solicitud, llaman al servicio y responden
│   ├── services/            Lógica de negocio (auth, pokemon, token)
│   ├── clients/             Cliente HTTP de PokéAPI con caché
│   ├── validators/          Esquemas Zod de entrada
│   ├── models/              Modelos de Mongoose (RefreshToken, User)
│   ├── middlewares/         requireAuth, manejo central de errores y 404
│   ├── errors/              HttpError y utilidades de errores de MongoDB
│   └── types/               Contrato de la API y formas de las respuestas de PokéAPI
└── frontend/src/
    ├── api/                 Cliente Axios (token + renovación automática) y llamadas
    ├── context/, hooks/     Estado de la sesión (AuthProvider, useAuth)
    ├── pages/               Login, registro e inicio
    ├── layouts/             Estructura de las pantallas públicas y privadas
    ├── components/          Campos de formulario, diálogos, rutas protegidas, etc.
    ├── types/               Tipos compartidos
    └── utils/               Validación de formularios
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
| GET    | `/api/pokemon/:id`                             | Detalle por número de Pokédex o nombre exacto                                                         |

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
      { "name": "static", "isHidden": false },
      { "name": "lightning-rod", "isHidden": true }
    ]
  }
}
```

### Otros

| Método | Ruta          | Descripción                                                                             |
| ------ | ------------- | --------------------------------------------------------------------------------------- |
| GET    | `/api/health` | Estado del servidor y de la base de datos (`200`, o `503` si MongoDB no está conectada) |

## Decisiones técnicas

### Sesión y autenticación

- **Access token (JWT, 15 min):** se envía como `Authorization: Bearer`. En el frontend se guarda solo en memoria, nunca en `localStorage`, para que un ataque XSS no pueda robarlo de forma persistente.
- **Refresh token (30 min de inactividad):**
  - Es un valor aleatorio opaco y viaja en una cookie `httpOnly` que JavaScript no puede leer, limitada a `/api/auth`.
  - En la base de datos se guarda solo su hash SHA-256, con un índice TTL que borra las sesiones vencidas.
  - Se rota en cada uso: cada renovación invalida el token anterior.
- **Renovación silenciosa:** al recargar la página o cuando una solicitud recibe un `401`, el cliente renueva la sesión una sola vez y reintenta. Si llegan varias solicitudes a la vez, comparten una única renovación.
- **Cierre de sesión real:** el logout borra la sesión en el servidor, no solo en el navegador.
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

### Otras decisiones

- **Prefijo `/api`:** todas las rutas (incluidas las de autenticación) cuelgan de `/api`, para separar claramente la API de cualquier otra ruta y facilitar un proxy inverso.
- **Idioma:** los textos visibles para el usuario, los mensajes de error, los logs y los comentarios están en español. Los nombres de variables, funciones, archivos y campos de la API están en inglés, por convención.
- **Sin capa de repositorio:** los servicios usan los modelos de Mongoose directamente. Con dos colecciones, una capa extra añadiría código sin beneficio real.
- **Despliegue en dominios separados:**
  - El backend permite CORS con credenciales solo desde `CLIENT_URL`.
  - En producción, la cookie de refresh usa `SameSite=None; Secure`, así que el backend debe servirse por HTTPS.
  - Algunos navegadores bloquean las cookies de terceros. Servir frontend y backend bajo el mismo dominio (ej. con un proxy inverso) evita el problema.
