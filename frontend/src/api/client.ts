import axios, { type AxiosError } from "axios";
import type { AuthResponse } from "../types/auth";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    // Marks a request already retried after a token refresh
    _retried?: boolean;
  }
}

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  // Lets the browser send/receive the httpOnly refresh token cookie
  withCredentials: true,
});

// The access token lives only in memory (never localStorage), so it is
// lost on page reload and recovered through a silent refresh
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

// Shared promise so simultaneous 401s trigger a single refresh
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

// A 401 on these means wrong credentials or no session, not an expired token
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
