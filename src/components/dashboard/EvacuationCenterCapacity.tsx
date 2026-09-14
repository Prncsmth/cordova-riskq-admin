import Link from "next/link";
import { Building2 } from "lucide-react";
import Badge from "@/components/ui/Badge";

// Mock data for UI — replace with real API data once backend endpoints are available.
const centers = [
  { name: "Gabi Evacuation Center", occupants: 120, capacity: 200 },
  { name: "Poblacion Evacuation Center", occupants: 85, capacity: 150 },
  { name: "Day-as Evacuation Center", occupants: 45, capacity: 100 },
];

function statusFor(pct: number) {
  if (pct >= 90) return { label: "Full", variant: "danger" as const, bar: "bg-danger" };
  if (pct >= 60) return { label: "Near Capacity", variant: "warning" as const, bar: "bg-warning" };
  return { label: "Available", variant: "success" as const, bar: "bg-success" };
}

export default function EvacuationCenterCapacity() {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info-light text-info">
            <Building2 size={15} />
          </span>
          <h2 className="text-lg font-semibold text-foreground">Evacuation Center Capacity</h2>
        </div>
        <Link href="/evacuation-centers" className="text-sm font-medium text-primary hover:text-primary-dark">
          View All
        </Link>
      </div>

      <div className="mt-5 space-y-1">
        {centers.map((center) => {
          const pct = Math.round((center.occupants / center.capacity) * 100);
          const status = statusFor(pct);

          return (
            <div key={center.name} className="rounded-xl p-2.5 transition-colors hover:bg-background/60">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{center.name}</span>
                <Badge variant={status.variant} solid={status.label === "Full"}>
                  {status.label}
                </Badge>
              </div>

              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-background">
                <div
                  className={`h-full rounded-full ${status.bar} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-1.5 flex justify-between text-xs text-text-tertiary">
                <span>{center.occupants} / {center.capacity} occupants</span>
                <span className="font-medium">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
