"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
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
  cancelled: "Resolved",
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

export function useSosAlerts() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; alerts: RawSosAlert[] }>("/admin/sos-alerts?limit=100", { token })
      .then((response) => {
        if (!cancelled) setAlerts(response.alerts.map(toSosAlert));
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
  }, [token]);

  return { alerts, loading, error };
}
