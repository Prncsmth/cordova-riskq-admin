"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { usePaginationState } from "@/hooks/usePaginationState";
import type { SupportRequest, SupportRequestStatus } from "@/types/support-request";

type SupportRequestSocketEvent = {
  kind: "created" | "updated";
  id: string;
  subject: string | null;
  topic: string;
  userName: string | null;
  userRole?: string;
};

// How long a just-arrived request keeps its "New" highlight.
const FRESH_MS = 10_000;

export function useSupportRequests(
  pagination: ReturnType<typeof usePaginationState>,
  status: "All" | SupportRequestStatus,
) {
  const { token } = useAuth();
  const socket = useSocket();
  const { page, pageSize, search } = pagination;
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);
  // Ids of requests that arrived live, and the newest arrival's summary --
  // the page highlights the row and shows a banner for a few seconds.
  const [freshIds, setFreshIds] = useState<string[]>([]);
  const [latestArrival, setLatestArrival] = useState<SupportRequestSocketEvent | null>(null);
  // A socket-triggered refetch updates the list in place; only the first
  // load and filter/page changes show the full "Loading..." state.
  const silentRefetchRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const silent = silentRefetchRef.current;
    silentRefetchRef.current = false;
    if (!silent) setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (status !== "All") params.set("status", status);

    apiFetch<{
      success: true;
      supportRequests: SupportRequest[];
      total: number;
      openCount: number;
    }>(`/admin/support-requests?${params.toString()}`, { token })
      .then((response) => {
        if (!cancelled) {
          setSupportRequests(response.supportRequests);
          setTotal(response.total);
          setOpenCount(response.openCount);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load support requests.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, search, status, refetchToken]);

  useEffect(() => {
    function handleSupportRequest(event: SupportRequestSocketEvent) {
      silentRefetchRef.current = true;
      setRefetchToken((t) => t + 1);

      if (event.kind !== "created") return;
      setLatestArrival(event);
      setFreshIds((ids) => [...ids, event.id]);
      setTimeout(() => {
        setFreshIds((ids) => ids.filter((id) => id !== event.id));
        setLatestArrival((current) => (current?.id === event.id ? null : current));
      }, FRESH_MS);
    }

    socket.on("admin:supportRequest", handleSupportRequest);
    return () => {
      socket.off("admin:supportRequest", handleSupportRequest);
    };
  }, [socket]);

  const updateStatus = useCallback(
    async (id: string, nextStatus: SupportRequestStatus) => {
      if (!token) return;

      setActionError(null);

      try {
        await apiFetch<{ success: true; supportRequest: SupportRequest }>(
          `/admin/support-requests/${id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus }),
            token,
          },
        );
        silentRefetchRef.current = true;
        setRefetchToken((t) => t + 1);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to update support request.");
        throw err;
      }
    },
    [token],
  );

  return {
    supportRequests,
    total,
    openCount,
    loading,
    error,
    actionError,
    updateStatus,
    freshIds,
    latestArrival,
  };
}
