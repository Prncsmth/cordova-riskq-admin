"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { EvacuationCenter } from "@/types/evacuation-center";
import { CORDOVA_BARANGAYS, jitter } from "@/lib/cordovaBarangays";

function barangay(id: string) {
  const found = CORDOVA_BARANGAYS.find((b) => b.id === id);
  if (!found) throw new Error(`Unknown Cordova barangay: ${id}`);
  return found;
}

const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted">
      Loading map...
    </div>
  ),
});

// Mock data for UI — replace with real API data once backend endpoints are available.
// Positions are each barangay's real coordinate (see lib/cordovaBarangays)
// with a small jitter, so e.g. the Gabi Evacuation Center actually sits
// inside Gabi on the map instead of a nearby-but-wrong point.
const [gabiPos, poblacionPos, dayAsPos, sanMiguelPos] = [
  jitter(barangay("gabi"), 0),
  jitter(barangay("poblacion"), 1),
  jitter(barangay("day-as"), 2),
  jitter(barangay("san-miguel"), 3),
];

const centers: EvacuationCenter[] = [
  { id: "EVC-01", name: "Gabi Evacuation Center", locationName: "Gabi, Cordova", occupants: 120, capacity: 200, latitude: gabiPos[0], longitude: gabiPos[1] },
  { id: "EVC-02", name: "Poblacion Evacuation Center", locationName: "Poblacion, Cordova", occupants: 85, capacity: 150, latitude: poblacionPos[0], longitude: poblacionPos[1] },
  { id: "EVC-03", name: "Day-as Evacuation Center", locationName: "Day-as, Cordova", occupants: 45, capacity: 100, latitude: dayAsPos[0], longitude: dayAsPos[1] },
  { id: "EVC-04", name: "San Miguel Evacuation Center", locationName: "San Miguel, Cordova", occupants: 12, capacity: 80, latitude: sanMiguelPos[0], longitude: sanMiguelPos[1] },
];

function statusFor(pct: number) {
  if (pct >= 90) return { label: "Full", variant: "danger" as const, bar: "bg-danger", accent: "border-l-danger" };
  if (pct >= 60) return { label: "Near Capacity", variant: "warning" as const, bar: "bg-warning", accent: "border-l-warning" };
  return { label: "Available", variant: "success" as const, bar: "bg-success", accent: "border-l-success" };
}

const statusFilters = ["All", "Available", "Near Capacity", "Full"] as const;

export default function EvacuationCenterList() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const filtered = useMemo(() => {
    return centers.filter((center) => {
      const pct = Math.round((center.occupants / center.capacity) * 100);
      const status = statusFor(pct);
      const matchesStatus = statusFilter === "All" || status.label === statusFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        center.name.toLowerCase().includes(q) ||
        center.locationName.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search centers or barangay..."
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

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white/60 p-10 text-center">
          <p className="font-semibold text-foreground">No centers match your filters</p>
          <p className="mt-1 text-sm text-muted">Try a different search term or status.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((center) => {
            const pct = Math.round((center.occupants / center.capacity) * 100);
            const status = statusFor(pct);

            return (
              <div
                key={center.id}
                className={`overflow-hidden rounded-2xl border border-l-4 border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md ${status.accent}`}
              >
                <div className="h-40 w-full">
                  <MiniMap
                    latitude={center.latitude}
                    longitude={center.longitude}
                    label={center.name}
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{center.name}</p>
                      <p className="text-sm text-muted">{center.locationName}</p>
                    </div>
                    <Badge variant={status.variant} solid={status.label === "Full"}>
                      {status.label}
                    </Badge>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-background">
                    <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${pct}%` }} />
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>{center.occupants} / {center.capacity} occupants</span>
                    <span>{pct}% full</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
