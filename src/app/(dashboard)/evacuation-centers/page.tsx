import { Building2, Users, BedDouble, Gauge } from "lucide-react";
import Card from "@/components/ui/Card";
import EvacuationCenterList from "@/components/evacuation-centers/EvacuationCenterList";

const stats = [
  { label: "Total Centers", value: "4", icon: Building2, color: "text-primary", bg: "bg-primary-light" },
  { label: "Total Capacity", value: "530", icon: BedDouble, color: "text-info", bg: "bg-info-light" },
  { label: "Currently Housed", value: "262", icon: Users, color: "text-success", bg: "bg-success-light" },
  { label: "Overall Occupancy", value: "49%", icon: Gauge, color: "text-warning", bg: "bg-warning-light" },
];

export default function EvacuationCentersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Evacuation Centers</h1>
        <p className="text-sm text-muted">
          Monitor occupancy and capacity across evacuation centers.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
                <Icon size={19} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <EvacuationCenterList />
    </div>
  );
}
