import Link from "next/link";
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
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Evacuation Center Capacity</h2>
        <Link href="/evacuation-centers" className="text-sm font-medium text-primary hover:text-primary-dark">
          View All
        </Link>
      </div>

      <div className="mt-5 space-y-5">
        {centers.map((center) => {
          const pct = Math.round((center.occupants / center.capacity) * 100);
          const status = statusFor(pct);

          return (
            <div key={center.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{center.name}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-background">
                <div className={`h-full rounded-full ${status.bar}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="mt-1 flex justify-between text-xs text-muted">
                <span>{center.occupants} / {center.capacity} occupants</span>
                <span>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
