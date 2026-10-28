import { api, setAccessToken } from "./client";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from "../types/auth";

export { refreshSession } from "./client";

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  setAccessToken(data.accessToken);
  return data;
}

export async function register(input: RegisterInput): Promise<User> {
  const { data } = await api.post<{ user: User }>("/auth/register", input);
  return data.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    // Olvida el token aunque la solicitud falle (ej. el servidor caído)
    setAccessToken(null);
  }
}
