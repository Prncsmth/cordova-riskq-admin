import { BellRing, CheckCheck, ShieldCheck, Siren } from "lucide-react";
import Card from "@/components/ui/Card";
import SosAlertTable from "@/components/sos-alerts/SosAlertTable";

const stats = [
  { label: "Total Alerts", value: "4", icon: Siren, color: "text-primary", bg: "bg-primary-light" },
  { label: "New", value: "1", icon: BellRing, color: "text-danger", bg: "bg-danger-light", pulse: true },
  { label: "Acknowledged", value: "1", icon: CheckCheck, color: "text-warning", bg: "bg-warning-light" },
  { label: "Resolved", value: "2", icon: ShieldCheck, color: "text-success", bg: "bg-success-light" },
];

export default function SosAlertsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SOS Alerts</h1>
        <p className="text-sm text-muted">
          Emergency SOS alerts received from citizens across Cordova.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                {stat.pulse && (
                  <span className={`absolute inline-flex h-11 w-11 animate-ping rounded-full ${stat.bg} opacity-60`} />
                )}
                <span className={`relative flex h-11 w-11 items-center justify-center rounded-full ${stat.bg} ${stat.color}`}>
                  <Icon size={19} />
                </span>
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <SosAlertTable />
    </div>
  );
}
