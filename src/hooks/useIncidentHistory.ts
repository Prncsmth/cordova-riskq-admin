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
  responseTimeSeconds: number | null;
};

export type IncidentHistoryFilters = {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  barangay?: string;
};

function buildQuery(filters: IncidentHistoryFilters): string {
  const params = new URLSearchParams({ limit: "100" });
  if (filters.startDate) params.set("startDate", filters.startDate.toISOString());
  if (filters.endDate) params.set("endDate", filters.endDate.toISOString());
  if (filters.category) params.set("category", filters.category);
  if (filters.barangay) params.set("barangay", filters.barangay);
  return params.toString();
}

// Terminal (completed/cancelled) incidents only -- GET /admin/history defaults
// to that when no `status` filter is passed. Shared by every admin view that
// needs incident history alongside the live incidents from useEmergencies().
export function useIncidentHistory(filters: IncidentHistoryFilters = {}) {
  const { token } = useAuth();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startDate, endDate, category, barangay } = filters;
  const startTime = startDate?.getTime();
  const endTime = endDate?.getTime();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const query = buildQuery({
      startDate: startTime ? new Date(startTime) : undefined,
      endDate: endTime ? new Date(endTime) : undefined,
      category,
      barangay,
    });

    apiFetch<{ success: true; records: HistoryRecord[] }>(`/admin/history?${query}`, { token })
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
  }, [token, startTime, endTime, category, barangay]);

  return { records, loading, error };
}
