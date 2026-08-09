import Card from "@/components/ui/Card";
import IncidentTrendChart from "@/components/analytics/IncidentTrendChart";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>

        <p className="max-w-3xl text-sm text-muted">
          View emergency and response performance analytics for Cordova RISKQ.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Total Emergencies
          </p>

          <p className="mt-4 text-3xl font-bold text-foreground">1,248</p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-muted">
            Average Response Time
          </p>

          <p className="mt-3 text-3xl font-bold text-foreground">8.4 min</p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-muted">
            Resolution Rate
          </p>

          <p className="mt-3 text-3xl font-bold text-foreground">94%</p>
        </Card>
      </div>

      <IncidentTrendChart />
    </div>
  );
}
