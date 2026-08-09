import IncidentTrendChart from "@/components/analytics/IncidentTrendChart";
import IncidentTypeChart from "@/components/analytics/IncidentTypeChart";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted">
          Trends and breakdowns across incidents, SOS alerts, and response performance.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <IncidentTrendChart />
        <IncidentTypeChart />
      </div>
    </div>
  );
}
