"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/types/user";

type RawUser = {
  id: string;
  name: string | null;
  email: string;
  mobile: string | null;
  role: User["role"];
  createdAt: string;
};

function toUser(row: RawUser): User {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email,
    phone: row.mobile ?? undefined,
    role: row.role,
    createdAt: row.createdAt,
  };
}

export function useUser(id: string) {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; user: RawUser }>(`/admin/users/${id}`, { token })
      .then((response) => {
        if (!cancelled) setUser(toUser(response.user));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load user.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, id]);

  return { user, loading, error };
}
