"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getMe, login, logout, register } from "@/lib/client-api";
import type { User } from "@/types/recipes";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const tokenStorageKey = "recipes_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(tokenStorageKey);

    if (!storedToken) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    queueMicrotask(() => {
      setToken(storedToken);
      getMe(storedToken)
        .then((response) => setUser(response.user))
        .catch(() => {
          window.localStorage.removeItem(tokenStorageKey);
          setToken(null);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      async loginUser(email, password) {
        const response = await login(email, password);
        window.localStorage.setItem(tokenStorageKey, response.token);
        setToken(response.token);
        setUser(response.user);
      },
      async registerUser(email, password) {
        const response = await register(email, password);
        window.localStorage.setItem(tokenStorageKey, response.token);
        setToken(response.token);
        setUser(response.user);
      },
      async logoutUser() {
        await logout(token).catch(() => undefined);
        window.localStorage.removeItem(tokenStorageKey);
        setToken(null);
        setUser(null);
      },
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
