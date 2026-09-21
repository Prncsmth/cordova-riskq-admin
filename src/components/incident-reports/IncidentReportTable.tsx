"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Flame, CloudRain, Car, HeartPulse, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import type { IncidentReport } from "@/types/incident-report";
import { timeAgo } from "@/lib/utils";

const statusVariant = {
  Active: "danger",
  Responding: "warning",
  Resolved: "success",
  Cancelled: "default",
} as const;

const typeStyles: Record<string, { icon: LucideIcon; color: string }> = {
  Fire: { icon: Flame, color: "text-danger" },
  Disaster: { icon: CloudRain, color: "text-info" },
  Accident: { icon: Car, color: "text-warning" },
  Medical: { icon: HeartPulse, color: "text-success" },
};

const defaultTypeStyle = { icon: FileText, color: "text-muted" };

const statusFilters = ["All", "Active", "Responding", "Resolved", "Cancelled"] as const;

export default function IncidentReportTable({
  reports,
  loading,
  error,
}: {
  reports: IncidentReport[];
  loading: boolean;
  error: string | null;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>("All");

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus = statusFilter === "All" || report.status === statusFilter;

      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        report.id.toLowerCase().includes(q) ||
        report.type.toLowerCase().includes(q) ||
        report.submittedBy.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [reports, query, statusFilter]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading reports…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        title="No incident reports yet"
        description="Reports citizens file will appear here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search report, type, submitter..."
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
                  ? "bg-primary hover:bg-primary-dark text-white shadow-sm"
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
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Report</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Submitted By</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Location</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">When</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Status</th>
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
                      <Icon size={20} className={`shrink-0 ${style.color}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{report.type}</p>
                        <Link
                          href={`/emergencies/${report.id}`}
                          className="text-xs font-medium text-primary hover:text-primary-dark"
                        >
                          {report.id}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-foreground">{report.submittedBy}</td>
                  <td className="p-4 text-muted">{report.locationName}</td>
                  <td className="p-4 text-muted">{timeAgo(report.createdAt)}</td>
                  <td className="p-4">
                    <Badge variant={statusVariant[report.status]} solid={report.status === "Active"}>
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
