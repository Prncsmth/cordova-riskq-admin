"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { buildDailyBuckets, isSameDay } from "@/lib/utils";
import type { Emergency } from "@/types/emergency";

export default function IncidentTrendChart({
  emergencies,
  startDate,
  endDate,
}: {
  emergencies: Emergency[];
  startDate: Date;
  endDate: Date;
}) {
  const data = useMemo(() => {
    return buildDailyBuckets(startDate, endDate).map(({ label, date }) => ({
      label,
      incidents: emergencies.filter((e) => isSameDay(e.createdAt, date)).length,
    }));
  }, [emergencies, startDate, endDate]);

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <h2 className="text-lg font-semibold text-foreground">Incident Trend</h2>
      <p className="text-sm text-muted">Daily incident volume across Cordova</p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="incidentTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c8102e" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#c8102e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} interval={Math.ceil(data.length / 8)} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }} />
            <Area type="monotone" dataKey="incidents" stroke="#c8102e" strokeWidth={2.5} fill="url(#incidentTrend)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
