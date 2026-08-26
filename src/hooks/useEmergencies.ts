"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Emergency, EmergencyStatus, EmergencyType } from "@/types/emergency";

type RawIncident = {
  id: string;
  category: string;
  details?: string | null;
  locationLabel: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  reporterId: string;
  acceptedByResponderId?: string | null;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_TO_TYPE: Record<string, EmergencyType> = {
  medical: "Medical",
  fire: "Fire",
  "road-accident": "Accident",
  flood: "Disaster",
  sos: "Other",
  other: "Other",
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
  return {
    id: raw.id,
    type: CATEGORY_TO_TYPE[raw.category] ?? "Other",
    description: raw.details ?? undefined,
    latitude: raw.latitude ?? 0,
    longitude: raw.longitude ?? 0,
    locationName: raw.locationLabel,
    status: STATUS_TO_EMERGENCY_STATUS[raw.status] ?? "Active",
    userId: raw.reporterId,
    responderId: raw.acceptedByResponderId ?? undefined,
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
