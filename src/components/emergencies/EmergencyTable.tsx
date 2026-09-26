"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import type { Emergency } from "@/types/emergency";
import { timeAgo } from "@/lib/utils";
import { emergencyTypeStyles, defaultEmergencyTypeStyle, emergencyStatusStyle } from "@/lib/emergencyStyles";

const statusFilters = ["All", "Active", "Responding", "Resolved", "Cancelled"] as const;

export default function EmergencyTable({
  emergencies,
  loading,
  error,
}: {
  emergencies: Emergency[];
  loading: boolean;
  error: string | null;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");
  // Client-side pagination -- unlike Responders/Users/SOS Alerts, this
  // table already loads its full (live + history) list into memory and
  // filters it in place, so paginating the already-filtered array here
  // matches that existing pattern instead of adding server-side paging to
  // useEmergenciesWithHistory just for this.
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    return emergencies.filter((emergency) => {
      const matchesStatus = statusFilter === "All" || emergency.status === statusFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        emergency.id.toLowerCase().includes(q) ||
        emergency.type.toLowerCase().includes(q) ||
        emergency.locationName.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [emergencies, query, statusFilter]);

  // Resets to page 1 when the search/status filter changes, computed
  // during render (React's recommended pattern for "adjusting state when
  // a prop/value changes") rather than in an effect -- avoids the extra
  // render-then-correct flash an effect-based reset would cause.
  const [prevFilterKey, setPrevFilterKey] = useState({ query, statusFilter });
  if (prevFilterKey.query !== query || prevFilterKey.statusFilter !== statusFilter) {
    setPrevFilterKey({ query, statusFilter });
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  // Clamped at render time, not via a separate effect -- if a live update
  // (an incident resolving and dropping out of the list, via
  // useEmergencies' socket merge) shrinks the result set out from under
  // whatever page the admin is on, this pulls the effective page back in
  // range without touching `page` state itself, so a distant update never
  // forces them back to page 1 the way the filter-change reset above does.
  const effectivePage = Math.min(page, totalPages);
  const paginated = filtered.slice((effectivePage - 1) * pageSize, effectivePage * pageSize);

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading incidents…
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

  if (emergencies.length === 0) {
    return (
      <EmptyState
        title="No active incidents"
        description="Reported emergencies will appear here as they come in."
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
            placeholder="Search ID, type, location..."
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
                  ? "bg-primary hover:bg-primary-dark text-white shadow-sm"
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
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Incident</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Location</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Responder</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Status</th>
              <th className="p-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {paginated.map((emergency) => {
              const style = emergencyTypeStyles[emergency.type] ?? defaultEmergencyTypeStyle;
              const Icon = style.icon;
              const status = emergencyStatusStyle[emergency.status];

              return (
                <tr key={emergency.id} className="transition-colors hover:bg-background/70">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={`shrink-0 ${style.color}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{emergency.type}</p>
                        <p className="text-xs text-muted">{emergency.id} &middot; {timeAgo(emergency.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{emergency.locationName}</td>
                  <td className="p-4 text-muted">{emergency.responderName ?? "Unassigned"}</td>
                  <td className="p-4">
                    <Badge variant={status.variant} solid={status.solid}>
                      {emergency.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/emergencies/${emergency.id}`}
                      className="font-medium text-primary hover:text-primary-dark"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-muted">
                  No incidents match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={effectivePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
