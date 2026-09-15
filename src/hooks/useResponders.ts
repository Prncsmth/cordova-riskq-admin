"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { usePaginationState } from "@/hooks/usePaginationState";
import { Responder } from "@/types/responder";

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

  return { responders, total, loading, error };
}

export function useResponderSummary() {
  const { token } = useAuth();
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

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; summary: typeof summary }>("/admin/responders/summary", { token })
      .then((response) => {
        if (!cancelled) setSummary(response.summary);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load responder summary.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return { summary, loading, error };
}

export function useResponder(id: string) {
  const { token } = useAuth();
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

  return { responder, loading, error };
}
