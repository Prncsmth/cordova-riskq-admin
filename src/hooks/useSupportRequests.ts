"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { usePaginationState } from "@/hooks/usePaginationState";
import type { SupportRequest, SupportRequestStatus } from "@/types/support-request";

export function useSupportRequests(
  pagination: ReturnType<typeof usePaginationState>,
  status: "All" | SupportRequestStatus,
) {
  const { token } = useAuth();
  const { page, pageSize, search } = pagination;
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
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
        setRefetchToken((t) => t + 1);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to update support request.");
        throw err;
      }
    },
    [token],
  );

  return { supportRequests, total, openCount, loading, error, actionError, updateStatus };
}
