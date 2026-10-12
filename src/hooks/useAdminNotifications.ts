"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { AdminActivity, AdminActivityType } from "@/hooks/useRecentActivity";

// Each admin's own inbox, from the server: every admin activity is saved as
// a Notification row per admin (backend: notificationWindow.ts), so read
// state is per admin and survives refreshes, other browsers and new
// sessions. The server lists only the last 24 hours (by createdAt); the
// same cutoff is applied here so a long-open page drops one as it expires.
const TTL_MS = 24 * 60 * 60 * 1000;

const ACTIVITY_TYPES: AdminActivityType[] = [
  "sos_alert",
  "incident_reported",
  "responder_joined",
  "incident_resolved",
  "evacuation_center_updated",
  "user_registered",
  "support_request",
];

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type AdminNotificationItem = {
  activity: AdminActivity;
  key: string;
  read: boolean;
};

// Only admin-activity rows: an admin's inbox can also hold e.g. an "All
// Users" announcement, which has no activity icon/link and was never shown
// in this feed.
function toItem(row: NotificationRow): AdminNotificationItem | null {
  if (!ACTIVITY_TYPES.includes(row.type as AdminActivityType)) return null;
  return {
    activity: {
      type: row.type as AdminActivityType,
      title: row.title,
      detail: row.body,
      occurredAt: row.createdAt,
    },
    key: row.id,
    read: row.read,
  };
}

const isFresh = (item: AdminNotificationItem, now: number) =>
  now - new Date(item.activity.occurredAt).getTime() < TTL_MS;

// The bell and the Notifications page each use this hook; a mark-read in
// one is broadcast here so the other updates without a refetch.
type ReadEvent = { ids: string[] } | { all: true };
const readListeners = new Set<(event: ReadEvent) => void>();
const broadcastRead = (event: ReadEvent) => readListeners.forEach((listener) => listener(event));

export function useAdminNotifications(limit = 10) {
  const { token } = useAuth();
  const socket = useSocket();
  const [items, setItems] = useState<AdminNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  // Ids with a mark-read request in flight -- a repeat click is ignored.
  const pendingRef = useRef(new Set<string>());

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    apiFetch<{ success: true; notifications: NotificationRow[] }>("/notifications", { token })
      .then((response) => {
        if (cancelled) return;
        setItems(response.notifications.map(toItem).filter((item): item is AdminNotificationItem => item !== null));
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load notifications.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  // New rows arrive live on this admin's user:<id> room.
  useEffect(() => {
    function handleNew(row: NotificationRow) {
      const item = toItem(row);
      if (!item) return;
      setItems((prev) => (prev.some((p) => p.key === item.key) ? prev : [item, ...prev]));
    }
    socket.on("notification:new", handleNew);
    return () => {
      socket.off("notification:new", handleNew);
    };
  }, [socket]);

  useEffect(() => {
    function handleRead(event: ReadEvent) {
      setItems((prev) =>
        prev.map((item) => ("all" in event || event.ids.includes(item.key) ? { ...item, read: true } : item)),
      );
    }
    readListeners.add(handleRead);
    return () => {
      readListeners.delete(handleRead);
    };
  }, []);

  // Re-checks expiry every minute so an open page drops a notification
  // once it turns 24 hours old.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Keeps the card visible and only clears its unread state, after the
  // server confirms (it's the source of truth).
  const markRead = useCallback(
    async (activity: AdminActivity) => {
      const item = items.find((i) => i.activity === activity);
      if (!token || !item || item.read || pendingRef.current.has(item.key)) return;
      pendingRef.current.add(item.key);
      try {
        await apiFetch(`/notifications/${item.key}/read`, { method: "PATCH", token });
        broadcastRead({ ids: [item.key] });
      } catch {
        // Stays unread so the admin can try again.
      } finally {
        pendingRef.current.delete(item.key);
      }
    },
    [items, token],
  );

  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await apiFetch("/notifications/read-all", { method: "PATCH", token });
      broadcastRead({ all: true });
    } catch {
      // Left as is; the button stays so the admin can retry.
    }
  }, [token]);

  const visible = items.filter((item) => isFresh(item, now)).slice(0, limit);
  const unreadCount = visible.filter((item) => !item.read).length;

  return { items: visible, loading, error, unreadCount, markRead, markAllRead };
}
