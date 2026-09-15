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

const MAX_ITEMS = 10;

// Fetches the initial feed via REST, then prepends live "admin:activity"
// socket events (see the backend's realtime/emit.ts emitAdminActivity) as
// they arrive -- no polling.
export function useRecentActivity() {
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
    setError(null);

    apiFetch<{ success: true; activities: AdminActivity[] }>("/admin/activity", { token })
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
  }, [token]);

  useEffect(() => {
    function handleActivity(activity: AdminActivity) {
      setActivities((prev) => [activity, ...prev].slice(0, MAX_ITEMS));
    }

    socket.on("admin:activity", handleActivity);
    return () => {
      socket.off("admin:activity", handleActivity);
    };
  }, [socket]);

  return { activities, loading, error };
}
