"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { usePaginationState } from "@/hooks/usePaginationState";
import type { Announcement, AnnouncementAudience, AnnouncementPriority } from "@/types/announcement";

type CreateAnnouncementInput = {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  barangayName?: string;
};

export function useAnnouncements(
  pagination: ReturnType<typeof usePaginationState>,
  priority: "All" | AnnouncementPriority,
) {
  const { token } = useAuth();
  const { page, pageSize, search } = pagination;
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
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
    if (priority !== "All") params.set("priority", priority);

    apiFetch<{ success: true; announcements: Announcement[]; total: number }>(
      `/admin/announcements?${params.toString()}`,
      { token },
    )
      .then((response) => {
        if (!cancelled) {
          setAnnouncements(response.announcements);
          setTotal(response.total);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load announcements.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, search, priority, refetchToken]);

  const create = useCallback(
    async (input: CreateAnnouncementInput) => {
      if (!token) return;

      setActionError(null);

      try {
        await apiFetch<{ success: true; announcement: Announcement }>("/admin/announcements", {
          method: "POST",
          body: JSON.stringify(input),
          token,
        });
        setRefetchToken((t) => t + 1);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to publish announcement.");
        throw err;
      }
    },
    [token],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!token) return;

      setActionError(null);

      try {
        await apiFetch<{ success: true }>(`/admin/announcements/${id}`, {
          method: "DELETE",
          token,
        });
        setRefetchToken((t) => t + 1);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to delete announcement.");
        throw err;
      }
    },
    [token],
  );

  return { announcements, total, loading, error, actionError, create, remove };
}
