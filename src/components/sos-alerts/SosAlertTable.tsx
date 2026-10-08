"use client";

import { useMemo } from "react";
import { Search, MapPinned } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import UnattendedBadge, { UNATTENDED_ROW_CLASS } from "@/components/emergencies/UnattendedBadge";
import { useNow } from "@/hooks/useNow";
import type { SosAlert, SosAlertStatus } from "@/types/sos-alert";
import { isUnattendedIncident } from "@/lib/unattended";
import { timeAgo } from "@/lib/utils";
import { haversineDistanceKm } from "@/lib/geo";

// Alerts within this radius, both still unaddressed, count as the same
// cluster -- e.g. one flood pocket producing several SOS alerts at once,
// rather than treating them as unrelated one-off cases.
const CLUSTER_RADIUS_KM = 1;

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
  onCloseAlert: (alert: SosAlert, outcome: "resolved" | "dismissed") => void;
  closingAlertId: string | null;
};

const statusVariant = {
  New: "danger",
  Acknowledged: "warning",
  Unattended: "info",
  Resolved: "success",
  Cancelled: "default",
} as const;

const statusFilters = ["All", "New", "Acknowledged", "Unattended", "Resolved", "Cancelled"] as const;

// "Unattended" stays the value (it's the backend's alertStatus filter) but
// reads "Expired" -- the live, derived UNATTENDED badge (lib/unattended.ts)
// is a different thing: a still-New alert nobody has picked up yet.
function statusLabel(status: (typeof statusFilters)[number]): string {
  return status === "Unattended" ? "Expired" : status;
}

// Mirrors the backend's canAdminCloseSosIncident: only alerts no responder
// has joined yet can be closed from here.
function canAdminClose(alert: SosAlert) {
  return alert.status === "New" || alert.status === "Unattended";
}

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
  onCloseAlert,
  closingAlertId,
}: SosAlertTableProps) {
  const now = useNow();
  // Triage view of this page's alerts: unaddressed ("New") ones first,
  // oldest-first among those, so nothing waiting for a look sinks to the
  // bottom under a wall of already-handled rows. Acknowledged/Resolved/
  // Cancelled keep the order the backend returned them in -- they're not
  // what a dispatcher is triaging right now.
  const sortedAlerts = useMemo(() => {
    const isNew = (a: SosAlert) => a.status === "New";
    return [...alerts].sort((a, b) => {
      if (isNew(a) !== isNew(b)) return isNew(a) ? -1 : 1;
      if (isNew(a) && isNew(b)) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
  }, [alerts]);

  // Nearby-cluster count per alert: other still-unaddressed alerts (New or
  // Acknowledged) within CLUSTER_RADIUS_KM. Surfaces "these are the same
  // flood pocket" instead of N unrelated-looking rows -- only computed
  // against alerts visible on this page, since the list is server-paginated.
  const clusterCounts = useMemo(() => {
    const counts = new Map<string, number>();
    const active = alerts.filter(
      (a) => (a.status === "New" || a.status === "Acknowledged") && (a.latitude !== 0 || a.longitude !== 0),
    );
    for (const a of active) {
      const nearby = active.filter(
        (b) => b.id !== a.id && haversineDistanceKm(a, b) <= CLUSTER_RADIUS_KM,
      ).length;
      if (nearby > 0) counts.set(a.id, nearby);
    }
    return counts;
  }, [alerts]);

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
              {statusLabel(status)}
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
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {sortedAlerts.map((alert) => {
                const nearby = clusterCounts.get(alert.id);
                const unattended = isUnattendedIncident(alert, now);
                return (
                <tr
                  key={alert.id}
                  className={`transition-colors hover:bg-background/70 ${
                    unattended ? UNATTENDED_ROW_CLASS : alert.status === "New" ? "bg-danger-light/20" : ""
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white shadow-xs">
                        {initials(alert.userName)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{alert.userName}</p>
                        <p className="text-xs text-muted">{alert.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted">
                    <div className="flex items-center gap-1.5">
                      {alert.locationName}
                      {nearby && (
                        <span
                          title={`${nearby} other unaddressed SOS alert${nearby === 1 ? "" : "s"} within ${CLUSTER_RADIUS_KM}km — likely the same incident area`}
                          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-light px-2 py-0.5 text-[11px] font-semibold text-warning"
                        >
                          <MapPinned size={11} />+{nearby} nearby
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-muted">{timeAgo(alert.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={statusVariant[alert.status]} solid={alert.status === "New"}>
                        {statusLabel(alert.status)}
                      </Badge>
                      {unattended && <UnattendedBadge />}
                    </div>
                  </td>
                  <td className="p-4">
                    {canAdminClose(alert) ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onCloseAlert(alert, "resolved")}
                          disabled={closingAlertId === alert.id}
                          title="Mark as handled outside the app, e.g. by phone"
                          className="rounded-lg bg-success-light px-2.5 py-1 text-xs font-semibold text-success transition hover:opacity-80 disabled:opacity-40"
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          onClick={() => onCloseAlert(alert, "dismissed")}
                          disabled={closingAlertId === alert.id}
                          title="Dismiss as a false alarm or duplicate"
                          className="rounded-lg bg-background px-2.5 py-1 text-xs font-semibold text-muted transition hover:text-foreground disabled:opacity-40"
                        >
                          Dismiss
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
                );
              })}

              {alerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-sm text-muted">
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
