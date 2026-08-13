"use client";

import dynamic from "next/dynamic";
import Badge from "@/components/ui/Badge";
import type { EvacuationCenter } from "@/types/evacuation-center";

const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted">
      Loading map...
    </div>
  ),
});

// Mock data for UI — replace with real API data once backend endpoints are available.
const centers: EvacuationCenter[] = [
  { id: "EVC-01", name: "Gabi Evacuation Center", locationName: "Gabi, Cordova", occupants: 120, capacity: 200, latitude: 10.2562, longitude: 123.9452 },
  { id: "EVC-02", name: "Poblacion Evacuation Center", locationName: "Poblacion, Cordova", occupants: 85, capacity: 150, latitude: 10.2482, longitude: 123.9518 },
  { id: "EVC-03", name: "Day-as Evacuation Center", locationName: "Day-as, Cordova", occupants: 45, capacity: 100, latitude: 10.2519, longitude: 123.9497 },
  { id: "EVC-04", name: "Ajoya Evacuation Center", locationName: "Ajoya, Cordova", occupants: 12, capacity: 80, latitude: 10.2501, longitude: 123.9463 },
];

function statusFor(pct: number) {
  if (pct >= 90) return { label: "Full", variant: "danger" as const, bar: "bg-danger" };
  if (pct >= 60) return { label: "Near Capacity", variant: "warning" as const, bar: "bg-warning" };
  return { label: "Available", variant: "success" as const, bar: "bg-success" };
}

export default function EvacuationCenterList() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {centers.map((center) => {
        const pct = Math.round((center.occupants / center.capacity) * 100);
        const status = statusFor(pct);

        return (
          <div key={center.id} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
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
                <Badge variant={status.variant}>{status.label}</Badge>
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
  );
}
