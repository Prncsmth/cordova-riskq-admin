"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Responder } from "@/types/responder";

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  mobile: string | null;
  role: string;
  createdAt: string;
};

function toResponder(row: AdminUserRow): Responder {
  return {
    id: row.id,
    name: row.name ?? "",
    email: row.email,
    phone: row.mobile,
    createdAt: row.createdAt,
  };
}

export function useResponders() {
  const { token } = useAuth();
  const [responders, setResponders] = useState<Responder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setError(null);

    apiFetch<{ success: true; users: AdminUserRow[] }>("/admin/users", { token })
      .then((response) => {
        if (!cancelled) {
          setResponders(
            response.users.filter((u) => u.role === "responder").map(toResponder)
          );
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
  }, [token]);

  return { responders, loading, error };
}
