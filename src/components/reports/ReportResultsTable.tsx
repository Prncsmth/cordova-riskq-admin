"use client";

import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { categoryToEmergencyType } from "@/lib/incidentCategory";
import { formatMinutes } from "@/lib/incidentStats";
import { formatDate } from "@/lib/utils";
import type { HistoryRecord } from "@/hooks/useIncidentHistory";

export default function ReportResultsTable({
  records,
  loading,
  error,
}: {
  records: HistoryRecord[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading report…
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

  if (records.length === 0) {
    return (
      <EmptyState
        title="No incidents match this report"
        description="Try widening the date range or clearing the category/barangay filters."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-background/60">
            <tr>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Type</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Location</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Reported By</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Responders</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Response Time</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Date</th>
              <th className="p-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {records.map((record) => (
              <tr key={record.id} className="transition-colors hover:bg-background/70">
                <td className="p-4 font-medium text-foreground">{categoryToEmergencyType(record.category)}</td>
                <td className="p-4 text-muted">{record.locationLabel}</td>
                <td className="p-4 text-muted">{record.reporter.name ?? "Unknown"}</td>
                <td className="p-4 text-muted">
                  {record.responders.length === 0
                    ? "—"
                    : record.responders.map((r) => r.name).join(", ")}
                </td>
                <td className="p-4 text-muted">
                  {record.responseTimeSeconds !== null ? formatMinutes(record.responseTimeSeconds) : "—"}
                </td>
                <td className="p-4 text-muted">{formatDate(record.createdAt)}</td>
                <td className="p-4">
                  <Badge variant={record.status === "completed" ? "success" : "default"}>
                    {record.status === "completed" ? "Resolved" : "Cancelled"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
