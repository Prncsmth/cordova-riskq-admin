"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export type HistoryRecord = {
  id: string;
  category: string;
  source: string;
  locationLabel: string;
  latitude: number | null;
  longitude: number | null;
  status: "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  reporter: { id: string; name: string | null };
  responders: { id: string; name: string; status: string }[];
  responseTimeSeconds: number | null;
  // Null until the backend records a resolution timestamp -- never derived
  // from updatedAt. Optional for an older backend that doesn't send it yet.
  resolutionTimeSeconds?: number | null;
};

export type IncidentHistoryFilters = {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  barangay?: string;
  responderId?: string;
};

function buildQuery(filters: IncidentHistoryFilters): string {
  const params = new URLSearchParams({ limit: "100" });
  if (filters.startDate) params.set("startDate", filters.startDate.toISOString());
  if (filters.endDate) params.set("endDate", filters.endDate.toISOString());
  if (filters.category) params.set("category", filters.category);
  if (filters.barangay) params.set("barangay", filters.barangay);
  if (filters.responderId) params.set("responderId", filters.responderId);
  return params.toString();
}

// Terminal (completed/cancelled) incidents only -- GET /admin/history defaults
// to that when no `status` filter is passed. Shared by every admin view that
// needs incident history alongside the live incidents from useEmergencies().
export function useIncidentHistory(filters: IncidentHistoryFilters = {}) {
  const { token } = useAuth();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startDate, endDate, category, barangay, responderId } = filters;
  const startTime = startDate?.getTime();
  const endTime = endDate?.getTime();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const query = buildQuery({
      startDate: startTime ? new Date(startTime) : undefined,
      endDate: endTime ? new Date(endTime) : undefined,
      category,
      barangay,
      responderId,
    });

    apiFetch<{ success: true; records: HistoryRecord[] }>(`/admin/history?${query}`, { token })
      .then((response) => {
        if (!cancelled) setRecords(response.records);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load incident history.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, startTime, endTime, category, barangay, responderId]);

  return { records, loading, error };
}

const RESPONDER_HISTORY_PAGE_SIZE = 10;

type ResponderHistoryState = {
  // "<responderId>:<page>:<attempt>" of the last finished request -- loading is derived
  // by comparing it with the current request instead of being set inside the
  // effect, so switching responders never shows the previous one's rows.
  loadedKey: string | null;
  responderId: string | null;
  records: HistoryRecord[];
  total: number;
  error: string | null;
};

// One responder's Past Incidents, newest first, a page at a time ("Load
// more" appends). GET /admin/history already excludes incidents this
// responder declined. Read-only.
export function useResponderIncidentHistory(responderId: string) {
  const { token } = useAuth();
  // attempt bumps on a retry so the same page can be requested again.
  const [request, setRequest] = useState({ responderId, page: 1, attempt: 0 });
  const [state, setState] = useState<ResponderHistoryState>({
    loadedKey: null,
    responderId: null,
    records: [],
    total: 0,
    error: null,
  });

  // A different responder starts back at page 1.
  const isSameResponder = request.responderId === responderId;
  const page = isSameResponder ? request.page : 1;
  const attempt = isSameResponder ? request.attempt : 0;
  const requestKey = `${responderId}:${page}:${attempt}`;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const params = new URLSearchParams({
      responderId,
      page: String(page),
      limit: String(RESPONDER_HISTORY_PAGE_SIZE),
    });

    apiFetch<{ success: true; records: HistoryRecord[]; total: number }>(`/admin/history?${params}`, { token })
      .then((response) => {
        if (cancelled) return;
        setState((prev) => ({
          loadedKey: requestKey,
          responderId,
          records:
            page > 1 && prev.responderId === responderId ? [...prev.records, ...response.records] : response.records,
          total: response.total,
          error: null,
        }));
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          loadedKey: requestKey,
          error: err instanceof Error ? err.message : "Failed to load incident history.",
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [token, responderId, page, requestKey]);

  const isCurrentResponder = state.responderId === responderId;
  const records = isCurrentResponder ? state.records : [];
  const loading = Boolean(token) && state.loadedKey !== requestKey;
  const error = state.loadedKey === requestKey ? state.error : null;
  // After a failed page, "Load more" retries that same page instead of
  // skipping past it.
  const loadMore = useCallback(() => {
    setRequest(
      error
        ? { responderId, page, attempt: attempt + 1 }
        : { responderId, page: page + 1, attempt: 0 },
    );
  }, [responderId, page, attempt, error]);

  return {
    records,
    total: isCurrentResponder ? state.total : 0,
    // True only for the very first page -- later pages keep the rows visible
    // and show "Loading…" on the button instead.
    loading: loading && page === 1,
    loadingMore: loading && page > 1,
    error,
    // A failed first page has nothing to retry from here (the error state
    // is shown instead); a failed later page keeps "Load more" as a retry.
    hasMore: isCurrentResponder && (records.length < state.total || (error !== null && page > 1)),
    loadMore,
  };
}
