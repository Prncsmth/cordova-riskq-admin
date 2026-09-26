"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import type { usePaginationState } from "@/hooks/usePaginationState";
import { Responder } from "@/types/responder";

// Mirrors the backend's AdminResponderDutyPayload (realtime/emit.ts) --
// fired by user.service.ts's updateDutyStatus, whatever screen (mobile
// responder app) triggered the toggle.
type ResponderDutyUpdate = {
  id: string;
  name: string | null;
  isOnDuty: boolean;
};

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  mobile: string | null;
  role: string;
  unit: string | null;
  isOnDuty: boolean;
  createdAt: string;
};

type DutyFilter = "all" | "on-duty" | "off-duty";
type UnitFilter = "all" | "BDRRMO" | "MDRRMO" | "unclassified";

function toResponder(row: AdminUserRow): Responder {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email,
    phone: row.mobile,
    isOnDuty: row.isOnDuty,
    unit: row.unit === "BDRRMO" || row.unit === "MDRRMO" ? row.unit : null,
    createdAt: row.createdAt,
  };
}

export function useResponders(
  pagination: ReturnType<typeof usePaginationState>,
  filters: { duty: DutyFilter; unit: UnitFilter },
) {
  const { token } = useAuth();
  const socket = useSocket();
  const { page, pageSize, search } = pagination;
  const { duty, unit } = filters;
  const [responders, setResponders] = useState<Responder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ role: "responder", page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (duty === "on-duty") params.set("duty", "true");
    if (duty === "off-duty") params.set("duty", "false");
    if (unit !== "all") params.set("unit", unit);

    apiFetch<{ success: true; users: AdminUserRow[]; total: number }>(
      `/admin/users?${params.toString()}`,
      { token },
    )
      .then((response) => {
        if (!cancelled) {
          setResponders(response.users.map(toResponder));
          setTotal(response.total);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load responders.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, page, pageSize, search, duty, unit]);

  // Keeps an already-loaded page's Duty column live -- patches the
  // matching row in place rather than refetching, so an unrelated toggle
  // elsewhere doesn't reset this table's scroll position or page. A
  // responder whose new duty state now falls outside the active `duty`
  // filter is left in place until the next filter/page change instead of
  // disappearing mid-view.
  useEffect(() => {
    function handleDutyChange(update: ResponderDutyUpdate) {
      setResponders((prev) =>
        prev.map((r) => (r.id === update.id ? { ...r, isOnDuty: update.isOnDuty } : r)),
      );
    }

    socket.on("admin:responderDutyChanged", handleDutyChange);
    return () => {
      socket.off("admin:responderDutyChanged", handleDutyChange);
    };
  }, [socket]);

  return { responders, total, loading, error };
}

export function useResponderSummary() {
  const { token } = useAuth();
  const socket = useSocket();
  const [summary, setSummary] = useState<{
    total: number;
    onDuty: number;
    offDuty: number;
    bdrrmo: number;
    mdrrmo: number;
    unclassified: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(() => {
    if (!token) return Promise.resolve();
    setError(null);
    return apiFetch<{ success: true; summary: typeof summary }>("/admin/responders/summary", { token })
      .then((response) => {
        setSummary(response.summary);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load responder summary.");
      });
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetchSummary().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [token, fetchSummary]);

  // The counts are cheap to recompute server-side and a duty toggle can
  // shift more than one bucket at once (on/off duty, plus this responder's
  // unit) -- refetching is simpler and no less accurate than trying to
  // derive the delta from just { id, isOnDuty } client-side.
  useEffect(() => {
    function handleDutyChange() {
      fetchSummary();
    }

    socket.on("admin:responderDutyChanged", handleDutyChange);
    return () => {
      socket.off("admin:responderDutyChanged", handleDutyChange);
    };
  }, [socket, fetchSummary]);

  return { summary, loading, error };
}

export function useResponder(id: string) {
  const { token } = useAuth();
  const socket = useSocket();
  const [responder, setResponder] = useState<Responder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; user: AdminUserRow }>(`/admin/users/${id}`, { token })
      .then((response) => {
        if (!cancelled) setResponder(toResponder(response.user));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load responder.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, id]);

  useEffect(() => {
    function handleDutyChange(update: ResponderDutyUpdate) {
      setResponder((prev) => (prev && prev.id === update.id ? { ...prev, isOnDuty: update.isOnDuty } : prev));
    }

    socket.on("admin:responderDutyChanged", handleDutyChange);
    return () => {
      socket.off("admin:responderDutyChanged", handleDutyChange);
    };
  }, [socket]);

  return { responder, loading, error };
}
