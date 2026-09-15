"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export function useUserNames() {
  const { token } = useAuth();
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; users: { id: string; name: string }[] }>("/admin/users/names", { token })
      .then((response) => {
        if (!cancelled) setNames(new Map(response.users.map((u) => [u.id, u.name])));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load user names.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { names, loading, error };
}
