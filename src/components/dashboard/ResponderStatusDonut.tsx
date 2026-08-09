"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const data = [
  { name: "Online", value: 64, color: "#15803d" },
  { name: "Busy", value: 12, color: "#b45309" },
  { name: "Offline", value: 6, color: "#d6cfc6" },
];

const total = data.reduce((sum, d) => sum + d.value, 0);

export default function ResponderStatusDonut() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Responder Status</h2>

      <div className="relative mx-auto mt-2 h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted">Total</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-medium text-muted">
              {entry.value} ({Math.round((entry.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/responders"
        className="mt-6 block w-full rounded-xl bg-primary py-2.5 text-center text-sm font-medium text-white transition hover:bg-primary-dark"
      >
        View Responders
      </Link>
    </div>
  );
}
