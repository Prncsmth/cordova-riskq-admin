"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Hotline } from "@/types/hotline";

export function useHotlines() {
  const { token } = useAuth();
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; hotlines: Hotline[] }>("/hotlines", { token })
      .then((response) => {
        if (!cancelled) setHotlines(response.hotlines);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load hotlines.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const updateHotline = useCallback(
    async (id: string, data: { name?: string; number?: string; category?: Hotline["category"] }) => {
      if (!token) return;

      setActionError(null);

      try {
        const response = await apiFetch<{ success: true; hotline: Hotline }>(
          `/admin/hotlines/${id}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
            token,
          }
        );

        setHotlines((prev) => prev.map((h) => (h.id === id ? response.hotline : h)));
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to update hotline.");
        throw err;
      }
    },
    [token]
  );

  return { hotlines, loading, error, actionError, updateHotline };
}
