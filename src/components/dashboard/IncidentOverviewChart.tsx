"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useEmergenciesWithHistory } from "@/hooks/useEmergenciesWithHistory";
import { isSameDay } from "@/lib/utils";
import type { Emergency } from "@/types/emergency";

const TREND_DAYS = 14;

function buildTrend(emergencies: Emergency[]) {
  const dayFormatter = new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric" });

  return Array.from({ length: TREND_DAYS }, (_, i) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (TREND_DAYS - 1 - i));

    const dayEmergencies = emergencies.filter((e) => isSameDay(e.createdAt, date));
    return {
      label: dayFormatter.format(date),
      incidents: dayEmergencies.length,
      sosAlerts: dayEmergencies.filter((e) => e.source === "sos").length,
    };
  });
}

export default function IncidentOverviewChart() {
  const { emergencies, loading, error } = useEmergenciesWithHistory();
  const trend = useMemo(() => buildTrend(emergencies), [emergencies]);

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <Activity size={15} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Incident Overview</h2>
          <p className="text-sm text-muted">Incidents and SOS alerts — last 14 days</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex h-64 items-center justify-center text-sm text-muted">Loading trend…</div>
      ) : error ? (
        <div className="mt-6 flex h-64 items-center justify-center text-sm text-red-700">{error}</div>
      ) : (
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="incidentsTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sosTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--danger)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--danger)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} interval={1} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="incidents"
                name="Incidents"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#incidentsTrend)"
              />
              <Area
                type="monotone"
                dataKey="sosAlerts"
                name="SOS Alerts"
                stroke="var(--danger)"
                strokeWidth={2.5}
                fill="url(#sosTrend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
