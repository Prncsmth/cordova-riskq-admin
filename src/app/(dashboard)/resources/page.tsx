import { Boxes, CheckCircle2, Clock, Wrench } from "lucide-react";
import Card from "@/components/ui/Card";
import ResourceTable from "@/components/resources/ResourceTable";

const stats = [
  { label: "Total Units", value: "14", icon: Boxes, color: "text-primary", bg: "bg-primary-light" },
  { label: "Available", value: "5", icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
  { label: "In Use", value: "5", icon: Clock, color: "text-warning", bg: "bg-warning-light" },
  { label: "In Maintenance", value: "4", icon: Wrench, color: "text-danger", bg: "bg-danger-light" },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipment / Resources</h1>
        <p className="text-sm text-muted">
          Track emergency equipment and resource availability.
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

      <ResourceTable />
    </div>
  );
}
