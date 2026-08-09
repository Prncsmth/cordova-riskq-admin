"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const data = [
  { month: "Mar", incidents: 58 },
  { month: "Apr", incidents: 64 },
  { month: "May", incidents: 71 },
  { month: "Jun", incidents: 60 },
  { month: "Jul", incidents: 82 },
  { month: "Aug", incidents: 76 },
];

export default function IncidentTrendChart() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Incident Trend (6 Months)</h2>
      <p className="text-sm text-muted">Monthly incident volume across Cordova</p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="incidentTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7a1128" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#7a1128" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e0d8" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b6260" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b6260" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e7e0d8", fontSize: 13 }} />
            <Area type="monotone" dataKey="incidents" stroke="#7a1128" strokeWidth={2.5} fill="url(#incidentTrend)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
