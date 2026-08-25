import { FileText, Clock, CheckCircle2, FileEdit } from "lucide-react";
import Card from "@/components/ui/Card";
import IncidentReportTable from "@/components/incident-reports/IncidentReportTable";

const stats = [
  { label: "Total Reports", value: "5", icon: FileText, color: "text-primary", bg: "bg-primary-light" },
  { label: "Awaiting Review", value: "2", icon: Clock, color: "text-warning", bg: "bg-warning-light" },
  { label: "Reviewed", value: "2", icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
  { label: "Drafts", value: "1", icon: FileEdit, color: "text-info", bg: "bg-info-light" },
];

export default function IncidentReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Incident Reports</h1>
        <p className="text-sm text-muted">
          Detailed reports filed for each recorded incident.
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

      <IncidentReportTable />
    </div>
  );
}
