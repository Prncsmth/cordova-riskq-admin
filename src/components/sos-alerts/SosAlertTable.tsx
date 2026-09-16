"use client";

import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import type { SosAlert, SosAlertStatus } from "@/types/sos-alert";
import { timeAgo } from "@/lib/utils";

type SosAlertTableProps = {
  alerts: SosAlert[];
  loading: boolean;
  error: string | null;
  searchInput: string;
  onSearchChange: (value: string) => void;
  statusFilter: "All" | SosAlertStatus;
  onStatusFilterChange: (value: "All" | SosAlertStatus) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const statusVariant = {
  New: "danger",
  Acknowledged: "warning",
  Resolved: "success",
} as const;

const statusFilters = ["All", "New", "Acknowledged", "Resolved"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SosAlertTable({
  alerts,
  loading,
  error,
  searchInput,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: SosAlertTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search user, location..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusFilterChange(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                statusFilter === status
                  ? "bg-primary text-white shadow-xs"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="p-10 text-center text-sm text-muted">Loading SOS alerts…</p>
      ) : error ? (
        <p className="p-10 text-center text-sm text-red-700">{error}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/60">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">User</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Location</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Received</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {alerts.map((alert) => (
                <tr
                  key={alert.id}
                  className={`transition-colors hover:bg-background/70 ${alert.status === "New" ? "bg-danger-light/20" : ""}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                        {alert.status === "New" && (
                          <span className="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-danger opacity-30" />
                        )}
                        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-xs">
                          {initials(alert.userName)}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{alert.userName}</p>
                        <p className="text-xs text-muted">{alert.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{alert.locationName}</td>
                  <td className="p-4 text-muted">{timeAgo(alert.createdAt)}</td>
                  <td className="p-4">
                    <Badge variant={statusVariant[alert.status]} solid={alert.status === "New"}>
                      {alert.status}
                    </Badge>
                  </td>
                </tr>
              ))}

              {alerts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-sm text-muted">
                    No SOS alerts match your search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
