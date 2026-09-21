"use client";

import { useMemo, useState } from "react";
import { Siren, BellRing, Timer, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import AnalyticsFilters from "@/components/analytics/AnalyticsFilters";
import IncidentTrendChart from "@/components/analytics/IncidentTrendChart";
import IncidentTypeChart from "@/components/analytics/IncidentTypeChart";
import SosAlertTrendChart from "@/components/analytics/SosAlertTrendChart";
import ResponseTimeByTypeChart from "@/components/analytics/ResponseTimeByTypeChart";
import IncidentsByHourChart from "@/components/analytics/IncidentsByHourChart";
import { useEmergenciesWithHistory } from "@/hooks/useEmergenciesWithHistory";
import { useIncidentHistory } from "@/hooks/useIncidentHistory";
import { getRangeBounds, type DateRangePreset } from "@/lib/dateRanges";
import { computeAvgResponseTime, computeResolutionRate } from "@/lib/incidentStats";

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRangePreset>("This Month");
  const { startDate, endDate } = useMemo(() => getRangeBounds(range), [range]);

  const { emergencies } = useEmergenciesWithHistory();
  const { records: historyRecords } = useIncidentHistory();

  const filteredEmergencies = useMemo(() => {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    return emergencies.filter((e) => {
      const createdAt = new Date(e.createdAt).getTime();
      return createdAt >= startTime && createdAt <= endTime;
    });
  }, [emergencies, startDate, endDate]);

  const filteredHistoryRecords = useMemo(() => {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    return historyRecords.filter((r) => {
      const createdAt = new Date(r.createdAt).getTime();
      return createdAt >= startTime && createdAt <= endTime;
    });
  }, [historyRecords, startDate, endDate]);

  const totalSosAlerts = filteredEmergencies.filter((e) => e.source === "sos").length;

  const stats = [
    { label: "Total Incidents", value: filteredEmergencies.length, icon: Siren, color: "text-danger" },
    { label: "Total SOS Alerts", value: totalSosAlerts, icon: BellRing, color: "text-warning" },
    { label: "Avg. Response Time", value: computeAvgResponseTime(filteredHistoryRecords), icon: Timer, color: "text-info" },
    { label: "Resolution Rate", value: computeResolutionRate(filteredHistoryRecords), icon: CheckCircle2, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            Trends and breakdowns across incidents, SOS alerts, and response performance.
          </p>
        </div>

        <AnalyticsFilters range={range} onRangeChange={setRange} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <Icon size={22} className={`shrink-0 ${stat.color}`} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <IncidentTrendChart emergencies={filteredEmergencies} startDate={startDate} endDate={endDate} />
        <SosAlertTrendChart emergencies={filteredEmergencies} startDate={startDate} endDate={endDate} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <IncidentTypeChart emergencies={filteredEmergencies} />
        <ResponseTimeByTypeChart records={filteredHistoryRecords} />
      </div>

      <IncidentsByHourChart emergencies={filteredEmergencies} />
    </div>
  );
}
