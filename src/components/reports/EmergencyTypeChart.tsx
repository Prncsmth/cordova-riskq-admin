"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const data = [
  { name: "Medical", value: 41, color: "#1d4ed8" },
  { name: "Fire", value: 24, color: "#dc2626" },
  { name: "Accident", value: 32, color: "#b45309" },
  { name: "Flood", value: 15, color: "#0891b2" },
  { name: "Crime", value: 9, color: "#c8102e" },
];

const total = data.reduce((sum, d) => sum + d.value, 0);

export default function EmergencyTypeChart() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="text-lg font-semibold text-foreground">Emergencies by Type</h2>
      <p className="text-sm text-muted">Share of total emergencies this period</p>

      <div className="relative mx-auto mt-4 h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={55} outerRadius={78} paddingAngle={3} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted">Total</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-medium text-muted">{Math.round((entry.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
