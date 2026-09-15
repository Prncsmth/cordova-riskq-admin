"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { EvacuationCenter, EvacuationCenterStatus } from "@/types/evacuation-center";

export function useEvacuationCenters() {
  const { token } = useAuth();
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
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

    apiFetch<{ success: true; centers: EvacuationCenter[] }>("/evacuation-centers", { token })
      .then((response) => {
        if (!cancelled) setCenters(response.centers);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load evacuation centers.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const updateCenter = useCallback(
    async (id: string, data: { status?: EvacuationCenterStatus; facilities?: string[] }) => {
      if (!token) return;

      setActionError(null);

      try {
        const response = await apiFetch<{ success: true; center: EvacuationCenter }>(
          `/admin/evacuation-centers/${id}`,
          {
            method: "PATCH",
            body: JSON.stringify(data),
            token,
          }
        );

        setCenters((prev) => prev.map((c) => (c.id === id ? response.center : c)));
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to update evacuation center.");
        throw err;
      }
    },
    [token]
  );

  return { centers, loading, error, actionError, updateCenter };
}
