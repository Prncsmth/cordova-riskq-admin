"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Emergency } from "@/types/emergency";

const HOUR_LABELS = [
  "12am", "2am", "4am", "6am", "8am", "10am",
  "12pm", "2pm", "4pm", "6pm", "8pm", "10pm",
];

export default function IncidentsByHourChart({ emergencies }: { emergencies: Emergency[] }) {
  const data = useMemo(() => {
    const buckets = new Array(12).fill(0);
    for (const e of emergencies) {
      const hour = new Date(e.createdAt).getHours();
      buckets[Math.floor(hour / 2)] += 1;
    }
    return HOUR_LABELS.map((hour, i) => ({ hour, incidents: buckets[i] }));
  }, [emergencies]);

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <h2 className="text-lg font-semibold text-foreground">Incidents by Time of Day</h2>
      <p className="text-sm text-muted">Peak reporting hours across the selected period</p>

      <div className="mt-6 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }} />
            <Bar dataKey="incidents" name="Incidents" fill="#c8102e" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
