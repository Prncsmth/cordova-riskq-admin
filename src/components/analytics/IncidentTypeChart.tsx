"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const data = [
  { type: "Fire", count: 24, color: "#dc2626" },
  { type: "Medical", count: 41, color: "#1d4ed8" },
  { type: "Flood", count: 15, color: "#0891b2" },
  { type: "Accident", count: 32, color: "#b45309" },
  { type: "Crime", count: 9, color: "#c8102e" },
];

export default function IncidentTypeChart() {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="text-lg font-semibold text-foreground">Incidents by Type</h2>
      <p className="text-sm text-muted">Breakdown of incident categories this month</p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" />
            <XAxis dataKey="type" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
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
