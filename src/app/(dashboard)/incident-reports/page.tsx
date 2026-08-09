import IncidentReportTable from "@/components/incident-reports/IncidentReportTable";

export default function IncidentReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incident Reports</h1>
        <p className="text-sm text-muted">
          Detailed reports filed for each recorded incident.
        </p>
      </div>

      <IncidentReportTable />
    </div>
  );
}
