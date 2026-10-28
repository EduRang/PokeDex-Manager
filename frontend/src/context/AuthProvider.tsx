import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";
import { setSessionExpiredHandler } from "../api/client";
import type { LoginInput, RegisterInput, User } from "../types/auth";
import { AuthContext, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const clearSession = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // On app start, try to restore the session from the refresh cookie
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
