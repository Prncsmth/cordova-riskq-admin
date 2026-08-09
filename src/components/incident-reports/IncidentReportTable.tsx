import Badge from "@/components/ui/Badge";
import type { IncidentReport } from "@/types/incident-report";

// Mock data for UI — replace with real API data once backend endpoints are available.
const reports: IncidentReport[] = [
  { id: "RPT-3021", incidentId: "INC-2026-0091", type: "Fire Incident", submittedBy: "Juan Dela Cruz", status: "Submitted", createdAt: "10 min ago" },
  { id: "RPT-3020", incidentId: "INC-2026-0089", type: "Flood Report", submittedBy: "Maria Garcia", status: "Reviewed", createdAt: "1 hr ago" },
  { id: "RPT-3019", incidentId: "INC-2026-0088", type: "Road Accident", submittedBy: "Pedro Santos", status: "Draft", createdAt: "2 hr ago" },
];

const statusVariant = {
  Draft: "default",
  Submitted: "warning",
  Reviewed: "success",
} as const;

export default function IncidentReportTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Report ID</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Incident</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Type</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Submitted By</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-background">
                <td className="p-4 font-semibold text-foreground">{report.id}</td>
                <td className="p-4 text-muted">{report.incidentId}</td>
                <td className="p-4 text-foreground">{report.type}</td>
                <td className="p-4 text-muted">{report.submittedBy}</td>
                <td className="p-4">
                  <Badge variant={statusVariant[report.status]}>{report.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
