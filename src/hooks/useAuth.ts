"use client";

import { useCallback, useState } from "react";
import { apiFetch } from "@/lib/api";
import { User } from "@/types/user";

const TOKEN_KEY = "riskq_admin_token";
const USER_KEY = "riskq_admin_user";
const AUTH_FLAG_KEY = "riskq_admin_authenticated";

type LoginResponse = {
  success: true;
  user: { id: string; email: string; name: string | null; role: string };
  token: string;
};

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)
  );
  const authenticated = token !== null;

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.user.role !== "admin") {
      throw new Error("This account does not have admin access.");
    }

    const nextUser: User = {
      id: response.user.id,
      name: response.user.name ?? "",
      email: response.user.email,
      role: "admin",
      createdAt: "",
    };

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    localStorage.setItem(AUTH_FLAG_KEY, "true");
    setToken(response.token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_FLAG_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return { authenticated, token, user, login, logout };
}
