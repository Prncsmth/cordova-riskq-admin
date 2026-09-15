"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export type HistoryRecord = {
  id: string;
  category: string;
  source: string;
  locationLabel: string;
  latitude: number | null;
  longitude: number | null;
  status: "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  reporter: { id: string; name: string | null };
  responders: { id: string; name: string; status: string }[];
};

// Terminal (completed/cancelled) incidents only -- GET /admin/history defaults
// to that when no `status` filter is passed. Shared by every admin view that
// needs incident history alongside the live incidents from useEmergencies().
export function useIncidentHistory() {
  const { token } = useAuth();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; records: HistoryRecord[] }>("/admin/history?limit=100", { token })
      .then((response) => {
        if (!cancelled) setRecords(response.records);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load incident history.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { records, loading, error };
}
