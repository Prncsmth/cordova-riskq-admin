"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { categoryToEmergencyType } from "@/lib/incidentCategory";
import { Emergency, EmergencyStatus } from "@/types/emergency";

type RawIncident = {
  id: string;
  category: string;
  // "sos" | "report" on the list endpoint (GET /incidents); the admin-facing
  // detail endpoint (GET /incidents/:id) doesn't return this field at all,
  // so it's optional here and defaults to "report" in toEmergency().
  source?: string;
  details?: string | null;
  locationLabel: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  reporterId: string;
  acceptedByResponderId?: string | null;
  // The full active roster, each with a real name -- acceptedByResponderId
  // is just an ID (a holdover from before the multi-responder roster
  // replaced the old single-acceptor model); this is what actually lets a
  // name be shown instead of that raw ID.
  responders?: { id: string; name: string; status: string }[];
  createdAt: string;
  updatedAt: string;
};

const STATUS_TO_EMERGENCY_STATUS: Record<string, EmergencyStatus> = {
  pending: "Active",
  lobby: "Responding",
  on_the_way: "Responding",
  arrived: "Responding",
  completed: "Resolved",
  cancelled: "Cancelled",
};

function toEmergency(raw: RawIncident): Emergency {
  const acceptedResponder = raw.responders?.find((r) => r.id === raw.acceptedByResponderId);

  return {
    id: raw.id,
    type: categoryToEmergencyType(raw.category),
    description: raw.details ?? undefined,
    latitude: raw.latitude ?? 0,
    longitude: raw.longitude ?? 0,
    locationName: raw.locationLabel,
    status: STATUS_TO_EMERGENCY_STATUS[raw.status] ?? "Active",
    source: raw.source === "sos" ? "sos" : "report",
    userId: raw.reporterId,
    responderId: raw.acceptedByResponderId ?? undefined,
    responderName: acceptedResponder?.name,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function useEmergencies() {
  const { token } = useAuth();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; incidents: RawIncident[] }>("/incidents", { token })
      .then((response) => {
        if (!cancelled) setEmergencies(response.incidents.map(toEmergency));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load incidents.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { emergencies, loading, error };
}

export function useEmergency(id: string) {
  const { token } = useAuth();
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; incident: RawIncident }>(`/incidents/${id}`, { token })
      .then((response) => {
        if (!cancelled) setEmergency(toEmergency(response.incident));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load incident.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, id]);

  return { emergency, loading, error };
}
