"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { SosAlert } from "@/types/sos-alert";
import { CORDOVA_BARANGAYS, jitter } from "@/lib/cordovaBarangays";

function barangay(id: string) {
  const found = CORDOVA_BARANGAYS.find((b) => b.id === id);
  if (!found) throw new Error(`Unknown Cordova barangay: ${id}`);
  return found;
}

// Mock data for UI — replace with real API data once backend endpoints are available.
// Positions are each barangay's real coordinate (see lib/cordovaBarangays)
// with a small jitter, so the pin actually lands inside the named barangay.
const [poblacionPos, dayAsPos, gabiPos, sanMiguelPos] = [
  jitter(barangay("poblacion"), 0),
  jitter(barangay("day-as"), 1),
  jitter(barangay("gabi"), 2),
  jitter(barangay("san-miguel"), 3),
];

const alerts: SosAlert[] = [
  { id: "SOS-1042", userName: "Ana Reyes", locationName: "Poblacion, Cordova", latitude: poblacionPos[0], longitude: poblacionPos[1], status: "New", receivedAt: "2 min ago" },
  { id: "SOS-1041", userName: "Mark Villanueva", locationName: "Day-as, Cordova", latitude: dayAsPos[0], longitude: dayAsPos[1], status: "Acknowledged", receivedAt: "18 min ago" },
  { id: "SOS-1040", userName: "Liza Fernandez", locationName: "Gabi, Cordova", latitude: gabiPos[0], longitude: gabiPos[1], status: "Resolved", receivedAt: "1 hr ago" },
  { id: "SOS-1039", userName: "Carlo Bautista", locationName: "San Miguel, Cordova", latitude: sanMiguelPos[0], longitude: sanMiguelPos[1], status: "Resolved", receivedAt: "3 hr ago" },
];

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

export default function SosAlertTable() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const filtered = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesStatus = statusFilter === "All" || alert.status === statusFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        alert.userName.toLowerCase().includes(q) ||
        alert.id.toLowerCase().includes(q) ||
        alert.locationName.toLowerCase().includes(q);

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
            placeholder="Search user, ID, location..."
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
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">User</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Location</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Received</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filtered.map((alert) => (
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
                      <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-b from-primary to-primary-dark text-xs font-semibold text-white shadow-sm">
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
                <td className="p-4 text-muted">{alert.receivedAt}</td>
                <td className="p-4">
                  <Badge variant={statusVariant[alert.status]} solid={alert.status === "New"}>
                    {alert.status}
                  </Badge>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-sm text-muted">
                  No SOS alerts match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
