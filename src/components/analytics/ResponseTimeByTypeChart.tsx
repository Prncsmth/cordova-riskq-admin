"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
// Colors match IncidentTypeChart's type -> color mapping so the two charts
// read as one linked system when viewed together.
const data = [
  { type: "Fire", minutes: 6.8, color: "#dc2626" },
  { type: "Medical", minutes: 5.9, color: "#1d4ed8" },
  { type: "Flood", minutes: 11.4, color: "#0891b2" },
  { type: "Accident", minutes: 8.2, color: "#b45309" },
  { type: "Crime", minutes: 9.6, color: "#c8102e" },
];

export default function ResponseTimeByTypeChart() {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="text-lg font-semibold text-foreground">Response Time by Type</h2>
      <p className="text-sm text-muted">Average minutes from report to dispatch, by incident type</p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" />
            <XAxis dataKey="type" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} unit=" min" width={56} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }}
              formatter={(value) => [`${value} min`, "Avg. response"]}
            />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
