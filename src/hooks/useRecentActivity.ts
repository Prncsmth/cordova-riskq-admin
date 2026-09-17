"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";

export type AdminActivityType =
  | "sos_alert"
  | "responder_joined"
  | "incident_resolved"
  | "evacuation_center_updated"
  | "user_registered";

export type AdminActivity = {
  type: AdminActivityType;
  title: string;
  detail: string;
  occurredAt: string;
};

// Fetches the initial feed via REST, then prepends live "admin:activity"
// socket events (see the backend's realtime/emit.ts emitAdminActivity) as
// they arrive -- no polling. `limit` defaults to 10 for the dashboard's
// compact widget; the Audit Logs page asks for a larger feed.
export function useRecentActivity(limit = 10) {
  const { token } = useAuth();
  const socket = useSocket();
  const [activities, setActivities] = useState<AdminActivity[]>([]);
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

    apiFetch<{ success: true; activities: AdminActivity[] }>(`/admin/activity?limit=${limit}`, { token })
      .then((response) => {
        if (!cancelled) setActivities(response.activities);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load recent activity.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, limit]);

  useEffect(() => {
    function handleActivity(activity: AdminActivity) {
      setActivities((prev) => [activity, ...prev].slice(0, limit));
    }

    socket.on("admin:activity", handleActivity);
    return () => {
      socket.off("admin:activity", handleActivity);
    };
  }, [socket, limit]);

  return { activities, loading, error };
}
