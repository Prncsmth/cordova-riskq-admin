"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Flame, CloudRain, Car, HeartPulse, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { IncidentReport } from "@/types/incident-report";

// Mock data for UI — replace with real API data once backend endpoints are available.
const reports: IncidentReport[] = [
  { id: "RPT-3021", incidentId: "INC-2026-0091", type: "Fire Incident", submittedBy: "Juan Dela Cruz", status: "Submitted", createdAt: "10 min ago" },
  { id: "RPT-3020", incidentId: "INC-2026-0089", type: "Flood Report", submittedBy: "Maria Garcia", status: "Reviewed", createdAt: "1 hr ago" },
  { id: "RPT-3019", incidentId: "INC-2026-0088", type: "Road Accident", submittedBy: "Pedro Santos", status: "Draft", createdAt: "2 hr ago" },
  { id: "RPT-3018", incidentId: "INC-2026-0090", type: "Medical Emergency", submittedBy: "Ana Reyes", status: "Submitted", createdAt: "5 hr ago" },
  { id: "RPT-3017", incidentId: "INC-2026-0087", type: "Fire Incident", submittedBy: "Juan Dela Cruz", status: "Reviewed", createdAt: "1 day ago" },
];

const statusVariant = {
  Draft: "default",
  Submitted: "warning",
  Reviewed: "success",
} as const;

const typeStyles: Record<string, { icon: LucideIcon; tile: string }> = {
  "Fire Incident": { icon: Flame, tile: "bg-danger-light text-danger" },
  "Flood Report": { icon: CloudRain, tile: "bg-info-light text-info" },
  "Road Accident": { icon: Car, tile: "bg-warning-light text-warning" },
  "Medical Emergency": { icon: HeartPulse, tile: "bg-success-light text-success" },
};

const defaultTypeStyle = { icon: FileText, tile: "bg-background text-muted" };

const statusFilters = ["All", "Draft", "Submitted", "Reviewed"] as const;

export default function IncidentReportTable() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus = statusFilter === "All" || report.status === statusFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        report.id.toLowerCase().includes(q) ||
        report.incidentId.toLowerCase().includes(q) ||
        report.type.toLowerCase().includes(q) ||
        report.submittedBy.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search report, incident, submitter..."
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                statusFilter === status
                  ? "bg-linear-to-b from-primary to-primary-dark text-white shadow-sm"
                  : "bg-background text-muted hover:bg-primary-light/40 hover:text-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/60">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Report</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Incident</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Submitted By</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">When</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {filtered.map((report) => {
              const style = typeStyles[report.type] ?? defaultTypeStyle;
              const Icon = style.icon;

              return (
                <tr key={report.id} className="transition-colors hover:bg-background/70">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.tile}`}>
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{report.type}</p>
                        <p className="text-xs text-muted">{report.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/emergencies/${report.incidentId}`}
                      className="font-medium text-primary hover:text-primary-dark"
                    >
                      {report.incidentId}
                    </Link>
                  </td>
                  <td className="p-4 text-foreground">{report.submittedBy}</td>
                  <td className="p-4 text-muted">{report.createdAt}</td>
                  <td className="p-4">
                    <Badge variant={statusVariant[report.status]} solid={report.status === "Submitted"}>
                      {report.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-sm text-muted">
                  No reports match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
