"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useRecentActivity, type AdminActivity } from "@/hooks/useRecentActivity";
import { getActivityKey } from "@/lib/adminActivity";

const READ_STORAGE_KEY = "riskq_admin_read_notifications";
const READ_ALL_BEFORE_STORAGE_KEY = "riskq_admin_read_all_before";
const MAX_STORED_KEYS = 200;

// "Mark all as read" stores a cutoff time instead of only the keys the caller
// had loaded: the header bell fetches 20 activities but the Notifications
// page fetches 50, so marking just the bell's 20 keys left the page's older
// rows unread (and its "Mark all as read" button still showing). Everything
// that occurred at or before this timestamp counts as read.
function loadReadAllBefore(): number {
  try {
    return Number(window.localStorage.getItem(READ_ALL_BEFORE_STORAGE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveReadAllBefore(value: number) {
  try {
    window.localStorage.setItem(READ_ALL_BEFORE_STORAGE_KEY, String(value));
  } catch {
    // localStorage unavailable -- read state just won't persist.
  }
}

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

// One read-state store shared by every useAdminNotifications() caller (the
// header bell and the Notifications page). Each used to hold its own copy
// loaded once on mount, so "Mark all as read" in one left the other still
// showing unread until a full reload.
type ReadState = { keys: Set<string>; readAllBefore: number };

const EMPTY_STATE: ReadState = { keys: new Set<string>(), readAllBefore: 0 };
const listeners = new Set<() => void>();
let readStateSnapshot: ReadState | null = null;

function loadReadState(): ReadState {
  return { keys: loadReadKeys(), readAllBefore: loadReadAllBefore() };
}

function getReadState(): ReadState {
  if (!readStateSnapshot) readStateSnapshot = loadReadState();
  return readStateSnapshot;
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab marking notifications read.
  function handleStorage(event: StorageEvent) {
    if (event.key !== READ_STORAGE_KEY && event.key !== READ_ALL_BEFORE_STORAGE_KEY) return;
    readStateSnapshot = loadReadState();
    listener();
  }
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

function addReadKeys(keys: string[]) {
  const current = getReadState();
  const next = new Set(current.keys);
  for (const key of keys) {
    // Re-inserted, not just added, so an already-read key moves to the end
    // and saveReadKeys' last-MAX_STORED_KEYS trim drops the oldest-touched
    // keys instead of ones still on screen.
    next.delete(key);
    next.add(key);
  }
  readStateSnapshot = { ...current, keys: next };
  saveReadKeys(next);
  notifyListeners();
}

function markReadThrough(timestamp: number) {
  const current = getReadState();
  if (timestamp <= current.readAllBefore) return;
  readStateSnapshot = { ...current, readAllBefore: timestamp };
  saveReadAllBefore(timestamp);
  notifyListeners();
}

function isRead(state: ReadState, activity: AdminActivity, key: string): boolean {
  return state.keys.has(key) || new Date(activity.occurredAt).getTime() <= state.readAllBefore;
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
  // Server snapshot is empty (no localStorage there); the client's real
  // read state takes over right after hydration.
  const readState = useSyncExternalStore(subscribe, getReadState, () => EMPTY_STATE);

  const markRead = useCallback((activity: AdminActivity) => {
    addReadKeys([getActivityKey(activity)]);
  }, []);

  const markAllRead = useCallback(() => {
    // Cutoff is the newest loaded activity's time (not Date.now()), so an
    // activity that arrives later stays unread, and a clock difference
    // between this browser and the server can't hide one.
    const newest = activities.reduce(
      (max, activity) => Math.max(max, new Date(activity.occurredAt).getTime()),
      0,
    );
    markReadThrough(newest);
  }, [activities]);

  const items: AdminNotificationItem[] = activities.map((activity) => {
    const key = getActivityKey(activity);
    return { activity, key, read: isRead(readState, activity, key) };
  });

  const unreadCount = items.filter((item) => !item.read).length;

  return { items, loading, error, unreadCount, markRead, markAllRead };
}
