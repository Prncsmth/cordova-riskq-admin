"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useUsers } from "@/hooks/useUsers";
import { categoryToEmergencyType } from "@/lib/incidentCategory";
import { IncidentReport } from "@/types/incident-report";

type HistoryRecord = {
  id: string;
  category: string;
  locationLabel: string;
  status: "completed" | "cancelled";
  createdAt: string;
  reporter: { id: string; name: string | null };
};

function useIncidentHistory() {
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

export function useIncidentReports() {
  const { emergencies, loading: loadingEmergencies, error: emergenciesError } = useEmergencies();
  const { users, loading: loadingUsers, error: usersError } = useUsers();
  const { records: history, loading: loadingHistory, error: historyError } = useIncidentHistory();

  const reports = useMemo<IncidentReport[]>(() => {
    const nameById = new Map(users.map((u) => [u.id, u.name || u.email]));

    const liveReports = emergencies.map((emergency) => ({
      id: emergency.id,
      type: emergency.type,
      locationName: emergency.locationName,
      submittedBy: nameById.get(emergency.userId) ?? "Unknown reporter",
      status: emergency.status,
      createdAt: emergency.createdAt,
    }));

    const historyReports = history.map((record) => ({
      id: record.id,
      type: categoryToEmergencyType(record.category),
      locationName: record.locationLabel,
      submittedBy: record.reporter.name ?? "Unknown reporter",
      status: record.status === "completed" ? ("Resolved" as const) : ("Cancelled" as const),
      createdAt: record.createdAt,
    }));

    return [...liveReports, ...historyReports].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [emergencies, users, history]);

  return {
    reports,
    loading: loadingEmergencies || loadingUsers || loadingHistory,
    error: emergenciesError ?? usersError ?? historyError,
  };
}
