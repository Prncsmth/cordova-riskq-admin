"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Review, ReviewStatus } from "@/types/review";

// Website reviews for moderation. Nothing reaches the public site until an
// admin approves it here.
export function useReviews(status: "All" | ReviewStatus, page: number, pageSize: number) {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);
  // Loading is derived (no setState in the effect body): a request is in
  // flight until the key it was made for is the one that last finished.
  const requestKey = `${status}|${page}|${pageSize}|${refetchToken}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = Boolean(token) && loadedKey !== requestKey;

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (status !== "All") params.set("status", status);

    apiFetch<{ success: true; reviews: Review[]; total: number; pendingCount: number }>(
      `/admin/reviews?${params.toString()}`,
      { token },
    )
      .then((response) => {
        if (cancelled) return;
        setReviews(response.reviews);
        setTotal(response.total);
        setPendingCount(response.pendingCount);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load reviews.");
      })
      .finally(() => {
        if (!cancelled) setLoadedKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [token, status, page, pageSize, refetchToken, requestKey]);

  const updateStatus = useCallback(
    async (id: string, next: ReviewStatus) => {
      if (!token) return;
      setActionError(null);
      try {
        await apiFetch(`/admin/reviews/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: next }),
          token,
        });
        setRefetchToken((t) => t + 1);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to update the review.");
      }
    },
    [token],
  );

  return { reviews, total, pendingCount, loading, error, actionError, updateStatus };
}
