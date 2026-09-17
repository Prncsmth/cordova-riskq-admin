"use client";

import { useCallback, useEffect, useState } from "react";
import { useRecentActivity, type AdminActivity } from "@/hooks/useRecentActivity";
import { getActivityKey } from "@/lib/adminActivity";

const READ_STORAGE_KEY = "riskq_admin_read_notifications";
const MAX_STORED_KEYS = 200;

function loadReadKeys(): Set<string> {
  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadKeys(keys: Set<string>) {
  try {
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(keys).slice(-MAX_STORED_KEYS)));
  } catch {
    // localStorage unavailable (private browsing, disabled) -- read state just won't persist.
  }
}

export type AdminNotificationItem = {
  activity: AdminActivity;
  key: string;
  read: boolean;
};

// Wraps useRecentActivity with a client-side (localStorage) read/unread flag
// -- there's no per-admin backend identity yet to persist this against, so
// it's tracked per-browser, same as the rest of this repo's "seen" UI state.
export function useAdminNotifications(limit = 10) {
  const { activities, loading, error } = useRecentActivity(limit);
  const [readKeys, setReadKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadKeys(loadReadKeys());
  }, []);

  const markRead = useCallback((activity: AdminActivity) => {
    setReadKeys((prev) => {
      const next = new Set(prev);
      next.add(getActivityKey(activity));
      saveReadKeys(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadKeys((prev) => {
      const next = new Set(prev);
      for (const activity of activities) next.add(getActivityKey(activity));
      saveReadKeys(next);
      return next;
    });
  }, [activities]);

  const items: AdminNotificationItem[] = activities.map((activity) => {
    const key = getActivityKey(activity);
    return { activity, key, read: readKeys.has(key) };
  });

  const unreadCount = items.filter((item) => !item.read).length;

  return { items, loading, error, unreadCount, markRead, markAllRead };
}
