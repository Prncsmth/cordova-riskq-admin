"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { usePaginationState } from "@/hooks/usePaginationState";
import type { SosAlert, SosAlertStatus } from "@/types/sos-alert";

type RawSosAlert = {
  id: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  createdAt: string;
  reporter: { id: string; name: string | null; mobile: string | null };
  incidentId: string | null;
  incidentStatus: string | null;
};

// SosAlert.status itself never changes after creation (always "active") --
// the real lifecycle lives on its linked Incident. Same idea as
// useEmergencies.ts's STATUS_TO_EMERGENCY_STATUS.
const INCIDENT_STATUS_TO_ALERT_STATUS: Record<string, SosAlertStatus> = {
  pending: "New",
  lobby: "Acknowledged",
  on_the_way: "Acknowledged",
  arrived: "Acknowledged",
  completed: "Resolved",
  // Was folded into "Resolved" -- a citizen who cancelled their own SOS
  // read as if a responder had actually resolved it. Mirrors the backend's
  // sosAlertStatus.ts (this table is the frontend copy of that mapping).
  cancelled: "Cancelled",
};

function toSosAlert(raw: RawSosAlert): SosAlert {
  return {
    id: raw.id,
    userName: raw.reporter.name ?? "Unknown",
    locationName: raw.locationLabel ?? "Location unavailable",
    latitude: raw.latitude ?? 0,
    longitude: raw.longitude ?? 0,
    status: raw.incidentStatus ? (INCIDENT_STATUS_TO_ALERT_STATUS[raw.incidentStatus] ?? "New") : "New",
    createdAt: raw.createdAt,
  };
}

export function useSosAlerts(pagination: ReturnType<typeof usePaginationState>, alertStatus: "All" | SosAlertStatus) {
  const { token } = useAuth();
  const { page, pageSize, search } = pagination;
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (alertStatus !== "All") params.set("alertStatus", alertStatus);

    apiFetch<{ success: true; alerts: RawSosAlert[]; total: number }>(
      `/admin/sos-alerts?${params.toString()}`,
      { token },
    )
      .then((response) => {
        if (!cancelled) {
          setAlerts(response.alerts.map(toSosAlert));
          setTotal(response.total);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load SOS alerts.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, search, alertStatus]);

  return { alerts, total, loading, error };
}

export function useSosAlertSummary() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<{
    total: number;
    New: number;
    Acknowledged: number;
    Resolved: number;
    Cancelled: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; summary: typeof summary }>("/admin/sos-alerts/summary", { token })
      .then((response) => {
        if (!cancelled) setSummary(response.summary);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load SOS alert summary.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { summary, loading, error };
}
