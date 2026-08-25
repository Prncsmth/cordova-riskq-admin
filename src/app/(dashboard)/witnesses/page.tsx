import { Eye, CheckCircle2, Clock, Percent } from "lucide-react";
import Card from "@/components/ui/Card";
import WitnessTable from "@/components/witnesses/WitnessTable";

const stats = [
  { label: "Total Witnesses", value: "3", icon: Eye, color: "text-primary", bg: "bg-primary-light" },
  { label: "Statements Given", value: "2", icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
  { label: "Pending Statements", value: "1", icon: Clock, color: "text-warning", bg: "bg-warning-light" },
  { label: "Response Rate", value: "67%", icon: Percent, color: "text-info", bg: "bg-info-light" },
];

export default function WitnessesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Witnesses</h1>
        <p className="text-sm text-muted">
          Witnesses associated with recorded incidents.
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

      <WitnessTable />
    </div>
  );
}
