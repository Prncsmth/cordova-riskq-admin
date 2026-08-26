"use client";

import { FileText, Clock, Radio, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import IncidentReportTable from "@/components/incident-reports/IncidentReportTable";
import { useIncidentReports } from "@/hooks/useIncidentReports";

export default function IncidentReportsPage() {
  const { reports, loading, error } = useIncidentReports();

  const stats = [
    { label: "Total Reports", value: reports.length, icon: FileText, color: "text-primary", bg: "bg-primary-light" },
    { label: "Active", value: reports.filter((r) => r.status === "Active").length, icon: Clock, color: "text-danger", bg: "bg-danger-light" },
    { label: "Responding", value: reports.filter((r) => r.status === "Responding").length, icon: Radio, color: "text-warning", bg: "bg-warning-light" },
    { label: "Resolved", value: reports.filter((r) => r.status === "Resolved").length, icon: CheckCircle2, color: "text-success", bg: "bg-success-light" },
  ];

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

      <IncidentReportTable reports={reports} loading={loading} error={error} />
    </div>
  );
}
