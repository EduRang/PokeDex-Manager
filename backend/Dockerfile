# ---- Compilación: TypeScript -> dist/ ----
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo los manifiestos: si no cambian, Docker reutiliza la capa de npm ci
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Ejecución: solo dependencias de producción y el código compilado ----
FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Incluye dist/scripts/db: el seed y la limpieza se ejecutan con node, sin tsx
COPY --from=build /app/dist ./dist

# Sin privilegios de root dentro del contenedor
USER node

EXPOSE 5000
CMD ["node", "dist/server.js"]
