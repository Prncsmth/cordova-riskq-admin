"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { MOCK_USERS as users } from "@/lib/mockUsers";

const statusFilters = ["All", "Active", "Suspended"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserTable() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, ID..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                statusFilter === status
                  ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/60">
            <tr>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">User</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Email</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Joined</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-muted">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filtered.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-background/70">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-dark text-xs font-semibold text-white shadow-sm">
                      {initials(user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted">{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-foreground">{user.email}</td>
                <td className="p-4 text-muted">{user.createdAt}</td>
                <td className="p-4">
                  <Badge variant={user.status === "Active" ? "success" : "danger"} solid={user.status === "Suspended"}>
                    {user.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <Link
                    href={`/users/${user.id}`}
                    className="font-medium text-primary hover:text-primary-dark"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-muted">
                  No users match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
