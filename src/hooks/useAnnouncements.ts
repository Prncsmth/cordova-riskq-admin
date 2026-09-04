"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { Announcement, AnnouncementAudience, AnnouncementPriority } from "@/types/announcement";

type CreateAnnouncementInput = {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  barangayName?: string;
};

export function useAnnouncements() {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; announcements: Announcement[] }>("/admin/announcements", { token })
      .then((response) => {
        if (!cancelled) setAnnouncements(response.announcements);
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
  }, [token]);

  const create = useCallback(
    async (input: CreateAnnouncementInput) => {
      if (!token) return;

      setActionError(null);

      try {
        const response = await apiFetch<{ success: true; announcement: Announcement }>(
          "/admin/announcements",
          {
            method: "POST",
            body: JSON.stringify(input),
            token,
          }
        );

        setAnnouncements((prev) => [response.announcement, ...prev]);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to publish announcement.");
        throw err;
      }
    },
    [token]
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

        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Failed to delete announcement.");
        throw err;
      }
    },
    [token]
  );

  return { announcements, loading, error, actionError, create, remove };
}
