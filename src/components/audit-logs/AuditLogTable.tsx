"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { ACTIVITY_TYPE_STYLE } from "@/lib/adminActivity";
import { formatDate } from "@/lib/utils";
import type { AdminActivity, AdminActivityType } from "@/hooks/useRecentActivity";

const typeFilters = ["All", ...Object.keys(ACTIVITY_TYPE_STYLE)] as (AdminActivityType | "All")[];

export default function AuditLogTable({
  activities,
  loading,
  error,
}: {
  activities: AdminActivity[];
  loading: boolean;
  error: string | null;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof typeFilters)[number]>("All");

  const filtered = useMemo(() => {
    return activities.filter((activity) => {
      const matchesType = typeFilter === "All" || activity.type === typeFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        activity.title.toLowerCase().includes(q) ||
        activity.detail.toLowerCase().includes(q);

      return matchesType && matchesQuery;
    });
  }, [activities, query, typeFilter]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading activity…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="SOS alerts, responder joins, incident resolutions, evacuation center updates, and new registrations will appear here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activity..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {typeFilters.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                typeFilter === type
                  ? "bg-primary text-white shadow-xs"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {type === "All" ? "All" : ACTIVITY_TYPE_STYLE[type].label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/60">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Event</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Detail</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filtered.map((activity, index) => {
              const style = ACTIVITY_TYPE_STYLE[activity.type];
              const Icon = style.icon;

              return (
                <tr key={index} className="transition-colors hover:bg-background/70">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                        <Icon size={16} className={style.color} />
                      </span>
                      <p className="font-medium text-foreground">{activity.title}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{activity.detail}</td>
                  <td className="p-4 text-muted">{formatDate(activity.occurredAt)}</td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="p-10 text-center text-sm text-muted">
                  No matching activity found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
