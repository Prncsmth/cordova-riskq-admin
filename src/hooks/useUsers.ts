"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { usePaginationState } from "@/hooks/usePaginationState";
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

export function useUsers(pagination: ReturnType<typeof usePaginationState>) {
  const { token } = useAuth();
  const { page, pageSize, search } = pagination;
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);

    apiFetch<{ success: true; users: AdminUserRow[]; total: number; newThisWeek: number }>(
      `/admin/users?${params.toString()}`,
      { token },
    )
      .then((response) => {
        if (!cancelled) {
          setUsers(response.users.map(toUser));
          setTotal(response.total);
          setNewThisWeek(response.newThisWeek);
        }
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
  }, [token, page, pageSize, search]);

  const changeRole = useCallback(
    async (id: string, role: "citizen" | "responder", unit?: "BDRRMO" | "MDRRMO") => {
      if (!token) return;

      setActionError(null);

      try {
        const response = await apiFetch<{ success: true; user: AdminUserRow }>(
          `/admin/users/${id}/role`,
          {
            method: "PATCH",
            body: JSON.stringify(role === "responder" ? { role, unit } : { role }),
            token,
          }
        );

        setUsers((prev) =>
          prev.map((u) => (u.id === id ? toUser(response.user) : u))
        );
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to change role.");
        throw err;
      }
    },
    [token]
  );

  return { users, total, newThisWeek, loading, error, actionError, changeRole };
}
