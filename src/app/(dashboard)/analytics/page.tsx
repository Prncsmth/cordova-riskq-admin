import { Siren, BellRing, Timer, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import AnalyticsFilters from "@/components/analytics/AnalyticsFilters";
import IncidentTrendChart from "@/components/analytics/IncidentTrendChart";
import IncidentTypeChart from "@/components/analytics/IncidentTypeChart";
import SosAlertTrendChart from "@/components/analytics/SosAlertTrendChart";
import ResponseTimeByTypeChart from "@/components/analytics/ResponseTimeByTypeChart";
import IncidentsByHourChart from "@/components/analytics/IncidentsByHourChart";

const stats = [
  { label: "Total Incidents", value: "411", icon: Siren, color: "text-danger", bg: "bg-danger-light" },
  { label: "Total SOS Alerts", value: "711", icon: BellRing, color: "text-warning", bg: "bg-warning-light" },
  { label: "Avg. Response Time", value: "8.4 min", icon: Timer, color: "text-info", bg: "bg-info-light" },
  { label: "Resolution Rate", value: "94%", icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            Trends and breakdowns across incidents, SOS alerts, and response performance.
          </p>
        </div>

        <AnalyticsFilters />
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

      <div className="grid gap-6 xl:grid-cols-2">
        <IncidentTrendChart />
        <SosAlertTrendChart />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <IncidentTypeChart />
        <ResponseTimeByTypeChart />
      </div>

      <IncidentsByHourChart />
    </div>
  );
}
