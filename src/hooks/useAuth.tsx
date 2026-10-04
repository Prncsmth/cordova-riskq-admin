"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
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

// localStorage-backed external store (read via useSyncExternalStore below)
// instead of useState+useEffect -- reading localStorage is a synchronous
// setState call inside an effect body, which React's set-state-in-effect
// rule flags as a cascading-render smell. It's also the wrong tool here
// specifically: authenticated gates a redirect in AdminLayout, so getting
// the server/first-client-paint snapshot wrong risks a real hydration
// mismatch, not just a lint complaint. useSyncExternalStore is the API
// built for exactly this -- external (non-React) state that must agree
// with the server on the first paint and only diverge after hydration.
type AuthSnapshot = { token: string | null; user: User | null };

const SERVER_SNAPSHOT: AuthSnapshot = { token: null, user: null };
let cachedSnapshot: AuthSnapshot | null = null;
const listeners = new Set<() => void>();

function readAuthFromStorage(): AuthSnapshot {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  let user: User | null = null;
  if (raw) {
    try {
      user = JSON.parse(raw) as User;
    } catch {
      user = null;
    }
  }
  return { token, user };
}

function getAuthSnapshot(): AuthSnapshot {
  if (cachedSnapshot === null) {
    cachedSnapshot = readAuthFromStorage();
  }
  return cachedSnapshot;
}

function getServerAuthSnapshot(): AuthSnapshot {
  return SERVER_SNAPSHOT;
}

function setAuthSnapshot(next: AuthSnapshot): void {
  cachedSnapshot = next;
  listeners.forEach((listener) => listener());
}

function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Standard React idiom for "has this component hydrated on the client yet" --
// subscribe is a no-op since it never changes after mount, so this never
// calls setState at all (there's nothing to call it from).
function useHasMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// Single shared auth state via Context, same pattern as ThemeProvider --
// previously a plain hook with independent useState per call site, so
// editing the admin's name in Settings (updateUser) updated only that
// component's own hook instance, leaving UserMenu/DashboardHeader's
// already-mounted copies of `user` stale until a full page reload.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getServerAuthSnapshot);
  const isHydrated = useHasMounted();

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
    setAuthSnapshot({ token: response.token, user: nextUser });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_FLAG_KEY);
    setAuthSnapshot({ token: null, user: null });
  }, []);

  const updateUser = useCallback((patch: Partial<Pick<User, "name" | "email">>) => {
    const current = getAuthSnapshot();
    if (!current.user) return;
    const next = { ...current.user, ...patch };
    localStorage.setItem(USER_KEY, JSON.stringify(next));
    setAuthSnapshot({ token: current.token, user: next });
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
