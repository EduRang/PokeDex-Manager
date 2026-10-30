import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";
import { setSessionExpiredHandler } from "../api/client";
import { clearCollectionCache } from "../hooks/useCollection";
import type { LoginInput, RegisterInput, User } from "../types/auth";
import { AuthContext, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Al cerrar o perder la sesión se olvida la colección cacheada, para que el
  // siguiente usuario no vea la del anterior
  const clearSession = useCallback(() => {
    clearCollectionCache();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // Al iniciar la app, intenta restaurar la sesión con la refresh cookie
  useEffect(() => {
    setSessionExpiredHandler(clearSession);

    authApi
      .refreshSession()
      .then((data) => {
        setUser(data.user);
        setStatus("authenticated");
      })
      .catch(clearSession);

    return () => setSessionExpiredHandler(null);
  }, [clearSession]);

  const login = useCallback(async (input: LoginInput) => {
    const data = await authApi.login(input);
    setUser(data.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      await authApi.register(input);
      await login({ identifier: input.email, password: input.password });
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
