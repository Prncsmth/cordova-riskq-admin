"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { userDisplayName } from "@/lib/userDisplayName";
import type { User } from "@/types/user";

type RawUser = {
  id: string;
  name: string | null;
  email: string;
  mobile: string | null;
  // Absent on an older backend.
  avatarUrl?: string | null;
  role: User["role"];
  createdAt: string;
};

function toUser(row: RawUser): User {
  return {
    id: row.id,
    name: userDisplayName(row.name, row.email),
    email: row.email,
    phone: row.mobile ?? undefined,
    avatarUrl: row.avatarUrl ?? null,
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
    // Unreachable once rendered -- see useEmergencies.ts's matching guard.
    if (!token) return;

    let cancelled = false;

    apiFetch<{ success: true; user: RawUser }>(`/admin/users/${id}`, { token })
      .then((response) => {
        if (!cancelled) {
          setUser(toUser(response.user));
          setError(null);
        }
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
