"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { User, UserRole } from "@/types/user";

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
};

function toUser(row: AdminUserRow): User {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email,
    role: row.role,
    createdAt: row.createdAt,
  };
}

export function useUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    setError(null);

    apiFetch<{ success: true; users: AdminUserRow[] }>("/admin/users", { token })
      .then((response) => {
        if (!cancelled) setUsers(response.users.map(toUser));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load users.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const changeRole = useCallback(
    async (id: string, role: "citizen" | "responder") => {
      if (!token) return;

      try {
        const response = await apiFetch<{ success: true; user: AdminUserRow }>(
          `/admin/users/${id}/role`,
          {
            method: "PATCH",
            body: JSON.stringify({ role }),
            token,
          }
        );

        setUsers((prev) =>
          prev.map((u) => (u.id === id ? toUser(response.user) : u))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to change role.");
        throw err;
      }
    },
    [token]
  );

  return { users, loading, error, changeRole };
}
