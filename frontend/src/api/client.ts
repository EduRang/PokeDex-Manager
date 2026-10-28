import axios, { type AxiosError } from "axios";
import type { AuthResponse } from "../types/auth";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    // Marca una solicitud ya reintentada tras refrescar el token
    _retried?: boolean;
  }
}

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  // Permite al navegador enviar/recibir la cookie httpOnly del refresh token
  withCredentials: true,
});

// El access token vive solo en memoria (nunca en localStorage), así que se
// pierde al recargar la página y se recupera con un refresh silencioso
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

// Promesa compartida para que varios 401 simultáneos hagan un solo refresh
let refreshPromise: Promise<AuthResponse> | null = null;

export function refreshSession(): Promise<AuthResponse> {
  refreshPromise ??= api
    .post<AuthResponse>("/auth/refresh")
    .then((res) => {
      setAccessToken(res.data.accessToken);
      return res.data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Un 401 en estas rutas significa credenciales incorrectas o sin sesión, no un token expirado
const NO_REFRESH_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !NO_REFRESH_URLS.includes(config.url ?? "");

    if (!shouldRefresh) {
      throw error;
    }

    config._retried = true;
    try {
      await refreshSession();
    } catch {
      setAccessToken(null);
      onSessionExpired?.();
      throw error;
    }
    return api(config);
  },
);
