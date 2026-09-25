"use client";

import { useMemo, useState } from "react";
import { Siren, Timer, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportResultsTable from "@/components/reports/ReportResultsTable";
import { useIncidentHistory } from "@/hooks/useIncidentHistory";
import { getRangeBounds, type DateRangePreset } from "@/lib/dateRanges";
import { computeAvgResponseTime, computeResolutionRate } from "@/lib/incidentStats";
import { downloadCsv } from "@/lib/csv";
import { categoryToEmergencyType } from "@/lib/incidentCategory";
import { formatDate } from "@/lib/utils";

export default function ReportsPage() {
  const [range, setRange] = useState<DateRangePreset>("This Month");
  const [category, setCategory] = useState("");
  const [barangay, setBarangay] = useState("");

  const { startDate, endDate } = useMemo(() => getRangeBounds(range), [range]);

  const { records, loading, error } = useIncidentHistory({
    startDate,
    endDate,
    category: category || undefined,
    barangay: barangay || undefined,
  });

  const stats = [
    { label: "Total Incidents", value: records.length, icon: Siren, color: "text-danger" },
    { label: "Avg. Response Time", value: computeAvgResponseTime(records), icon: Timer, color: "text-info" },
    { label: "Resolution Rate", value: computeResolutionRate(records), icon: CheckCircle2, color: "text-success" },
  ];

  function handleExport() {
    downloadCsv(
      `cordova-riskq-report-${range.toLowerCase().replace(/\s+/g, "-")}.csv`,
      ["Type", "Location", "Reported By", "Responders", "Response Time (min)", "Date", "Status"],
      records.map((record) => [
        categoryToEmergencyType(record.category),
        record.locationLabel,
        record.reporter.name ?? "Unknown",
        record.responders.map((r) => r.name).join("; ") || "—",
        record.responseTimeSeconds !== null ? (record.responseTimeSeconds / 60).toFixed(1) : "",
        formatDate(record.createdAt),
        record.status === "completed" ? "Resolved" : "Cancelled",
      ])
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Reports</h1>

        <p className="max-w-3xl text-sm text-muted">
          Generate and export a report of resolved and cancelled incidents for Cordova RISKQ.
        </p>
      </div>

      <ReportFilters
        range={range}
        onRangeChange={setRange}
        category={category}
        onCategoryChange={setCategory}
        barangay={barangay}
        onBarangayChange={setBarangay}
        onExport={handleExport}
        exportDisabled={loading || records.length === 0}
      />

      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4 shadow-md">
              <Icon size={22} className={`shrink-0 ${stat.color}`} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <ReportResultsTable records={records} loading={loading} error={error} />
    </div>
  );
}
