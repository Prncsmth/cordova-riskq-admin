"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { categoryToEmergencyType } from "@/lib/incidentCategory";
import { TERMINAL_EMERGENCY_STATUSES } from "@/lib/emergencyStyles";
import { Emergency, EmergencyStatus } from "@/types/emergency";

type RawIncident = {
  id: string;
  category: string;
  // "sos" | "report" -- returned by both GET /incidents and GET /incidents/:id
  // for admins (and in the admin:incidentUpdate broadcast). Optional only as
  // a defensive fallback: toEmergency() treats a missing value as "report".
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
  expired: "Expired",
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
    responderIds: raw.responders?.map((r) => r.id) ?? [],
    responders: raw.responders ?? [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function useEmergencies() {
  const { token } = useAuth();
  const socket = useSocket();
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

  // GET /incidents only ever returns non-terminal incidents, so this list is
  // meant to hold live ones only -- see useEmergenciesWithHistory, which adds
  // completed/cancelled incidents separately from GET /admin/history. A
  // terminal update here removes the incident (its marker/row disappears)
  // rather than upserting it as "Resolved"/"Cancelled" into this list.
  useEffect(() => {
    function handleIncidentUpdate(raw: RawIncident) {
      const emergency = toEmergency(raw);
      const isTerminal = TERMINAL_EMERGENCY_STATUSES.includes(emergency.status);

      setEmergencies((prev) => {
        if (isTerminal) return prev.filter((e) => e.id !== emergency.id);
        const exists = prev.some((e) => e.id === emergency.id);
        if (!exists) return [emergency, ...prev];
        return prev.map((e) => (e.id === emergency.id ? emergency : e));
      });
    }

    socket.on("admin:incidentUpdate", handleIncidentUpdate);
    return () => {
      socket.off("admin:incidentUpdate", handleIncidentUpdate);
    };
  }, [socket]);

  return { emergencies, loading, error };
}

export function useEmergency(id: string) {
  const { token } = useAuth();
  const socket = useSocket();
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

  // Same admin:incidentUpdate stream useEmergencies listens to, narrowed to
  // this one incident -- keeps the status badge and assigned responder live
  // as responders join, head out, arrive, or close it, without a reload.
  useEffect(() => {
    function handleIncidentUpdate(raw: RawIncident) {
      if (raw.id !== id) return;
      setEmergency(toEmergency(raw));
    }

    socket.on("admin:incidentUpdate", handleIncidentUpdate);
    return () => {
      socket.off("admin:incidentUpdate", handleIncidentUpdate);
    };
  }, [socket, id]);

  return { emergency, loading, error };
}
