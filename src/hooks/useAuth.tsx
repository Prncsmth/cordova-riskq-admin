"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
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

type AuthContextValue = {
  authenticated: boolean;
  isHydrated: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<Pick<User, "name" | "email">>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

// Single shared auth state via Context, same pattern as ThemeProvider --
// previously a plain hook with independent useState per call site, so
// editing the admin's name in Settings (updateUser) updated only that
// component's own hook instance, leaving UserMenu/DashboardHeader's
// already-mounted copies of `user` stale until a full page reload.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
    setUser(readStoredUser());
    setIsHydrated(true);
  }, []);

  // Requires the stored user to actually be role "admin", not just the
  // presence of a token -- login() already rejects a non-admin account, but
  // this check previously only looked at the token, so a non-admin token
  // obtained any other way (e.g. calling the shared /auth/login endpoint
  // directly) still passed. The backend independently re-checks role on
  // every /admin/* route and the Socket.IO admin room join regardless, so
  // this is defense-in-depth for a cleaner client experience, not the real
  // security boundary.
  const authenticated = token !== null && user?.role === "admin";

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

  const updateUser = useCallback((patch: Partial<Pick<User, "name" | "email">>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, isHydrated, token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
