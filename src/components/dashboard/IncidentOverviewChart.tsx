"use client";

import { useState } from "react";
import { Activity } from "lucide-react";
import {
  AreaChart,
  Area,
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
    <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
            <Activity size={15} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Incident Overview</h2>
            <p className="text-sm text-muted">Incidents and SOS alerts trend</p>
          </div>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
          className="rounded-xl border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground shadow-xs transition hover:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/15"
        >
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
      </div>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="incidentsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c8102e" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#c8102e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sosFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b45309" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#b45309" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e6e9eb",
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Area type="monotone" dataKey="incidents" name="Incidents" stroke="#c8102e" strokeWidth={2.5} fill="url(#incidentsFill)" dot={false} />
            <Area type="monotone" dataKey="sos" name="SOS Alerts" stroke="#b45309" strokeWidth={2.5} fill="url(#sosFill)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border/70 pt-5 sm:grid-cols-4">
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
