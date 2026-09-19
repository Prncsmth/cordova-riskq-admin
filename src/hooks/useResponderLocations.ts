"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";

export type ResponderLocation = {
  responderId: string;
  responderName: string;
  incidentId: string;
  latitude: number;
  longitude: number;
  locationUpdatedAt: string | null;
};

// Only responders currently "on_the_way" to a non-terminal incident have a
// location at all (see the backend's tracking.service.ts) -- idle on-duty
// responders intentionally have no entry here. Fetches the initial list via
// REST, then keeps individual entries fresh via live "admin:responderLocation"
// socket events (see the backend's emitAdminResponderLocation), same pattern
// as useRecentActivity's "admin:activity" listener.
export function useResponderLocations() {
  const { token } = useAuth();
  const socket = useSocket();
  const [responders, setResponders] = useState<ResponderLocation[]>([]);
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

    apiFetch<{ success: true; responders: ResponderLocation[] }>("/admin/responders/en-route", { token })
      .then((response) => {
        if (!cancelled) setResponders(response.responders);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load responder locations.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    function handleLocation(update: ResponderLocation) {
      setResponders((prev) => {
        const exists = prev.some((r) => r.responderId === update.responderId);
        if (!exists) return [...prev, update];
        return prev.map((r) => (r.responderId === update.responderId ? { ...r, ...update } : r));
      });
    }

    socket.on("admin:responderLocation", handleLocation);
    return () => {
      socket.off("admin:responderLocation", handleLocation);
    };
  }, [socket]);

  return { responders, loading, error };
}
