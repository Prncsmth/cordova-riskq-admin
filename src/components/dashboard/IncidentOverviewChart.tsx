"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Range = "Today" | "This Week" | "This Month";

// Mock data for UI — replace with real API data once backend endpoints are available.
const datasets: Record<Range, { label: string; incidents: number; sos: number }[]> = {
  Today: [
    { label: "12am", incidents: 1, sos: 2 },
    { label: "4am", incidents: 0, sos: 1 },
    { label: "8am", incidents: 3, sos: 5 },
    { label: "12pm", incidents: 4, sos: 6 },
    { label: "4pm", incidents: 2, sos: 4 },
    { label: "8pm", incidents: 2, sos: 3 },
  ],
  "This Week": [
    { label: "Sun", incidents: 8, sos: 18 },
    { label: "Mon", incidents: 10, sos: 22 },
    { label: "Tue", incidents: 14, sos: 25 },
    { label: "Wed", incidents: 9, sos: 15 },
    { label: "Thu", incidents: 11, sos: 20 },
    { label: "Fri", incidents: 13, sos: 24 },
    { label: "Sat", incidents: 11, sos: 21 },
  ],
  "This Month": [
    { label: "Wk 1", incidents: 42, sos: 88 },
    { label: "Wk 2", incidents: 38, sos: 76 },
    { label: "Wk 3", incidents: 51, sos: 95 },
    { label: "Wk 4", incidents: 45, sos: 84 },
  ],
};

const summary = {
  Today: { total: 12, sos: 21, resolved: 8, pending: 4 },
  "This Week": { total: 76, sos: 153, resolved: 51, pending: 25 },
  "This Month": { total: 312, sos: 601, resolved: 270, pending: 42 },
};

export default function IncidentOverviewChart() {
  const [range, setRange] = useState<Range>("This Week");
  const data = datasets[range];
  const stats = summary[range];

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Incident Overview</h2>
          <p className="text-sm text-muted">Incidents and SOS alerts trend</p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d8" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b6260" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b6260" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e7e0d8",
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Line type="monotone" dataKey="incidents" name="Incidents" stroke="#7a1128" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="sos" name="SOS Alerts" stroke="#b45309" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
        <SummaryStat label="Total Incidents" value={stats.total} />
        <SummaryStat label="Total SOS Alerts" value={stats.sos} />
        <SummaryStat label="Resolved" value={stats.resolved} />
        <SummaryStat label="Pending" value={stats.pending} />
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
