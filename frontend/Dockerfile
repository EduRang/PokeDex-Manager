# ---- Compilación: Vite -> dist/ ----
FROM node:22-alpine AS build
WORKDIR /app

# Primero solo los manifiestos: si no cambian, Docker reutiliza la capa de npm ci
COPY package.json package-lock.json ./
RUN npm ci

# Vite escribe la URL del backend en el código al compilar, así que llega
# como argumento de construcción y no como variable de entorno al ejecutar.
# Es obligatoria: sin ella la imagen apuntaría a una URL equivocada sin dar
# error. Los ARG ya están disponibles como variables de entorno en los RUN
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "Falta --build-arg VITE_API_URL" && exit 1)

COPY . .
RUN npm run build

# ---- Ejecución: NGINX sirve solo los archivos estáticos ----
# Variante oficial de NGINX que funciona sin root (escucha en el 8080)
FROM nginxinc/nginx-unprivileged:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
