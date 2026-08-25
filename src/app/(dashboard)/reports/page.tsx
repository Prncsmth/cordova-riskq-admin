import { Siren, Timer, CheckCircle2, HeartHandshake } from "lucide-react";
import Card from "@/components/ui/Card";
import ReportFilters from "@/components/reports/ReportFilters";
import IncidentTrendChart from "@/components/analytics/IncidentTrendChart";
import EmergencyChart from "@/components/reports/EmergencyChart";
import EmergencyTypeChart from "@/components/reports/EmergencyTypeChart";
import ResponseTimeChart from "@/components/reports/ResponseTimeChart";

const stats = [
  { label: "Total Emergencies", value: "1,248", icon: Siren, color: "text-danger", bg: "bg-danger-light" },
  { label: "Avg. Response Time", value: "8.4 min", icon: Timer, color: "text-info", bg: "bg-info-light" },
  { label: "Resolution Rate", value: "94%", icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
  { label: "People Assisted", value: "3,102", icon: HeartHandshake, color: "text-primary", bg: "bg-primary-light" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>

        <p className="max-w-3xl text-sm text-muted">
          View emergency and response performance analytics for Cordova RISKQ.
        </p>
      </div>

      <ReportFilters />

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
        <EmergencyTypeChart />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <EmergencyChart />
        <ResponseTimeChart />
      </div>
    </div>
  );
}
