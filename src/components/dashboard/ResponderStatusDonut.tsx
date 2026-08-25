"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const data = [
  { name: "Online", value: 64, color: "#1e8e3e" },
  { name: "Busy", value: 12, color: "#b45309" },
  { name: "Offline", value: 6, color: "#d6cfc6" },
];

const total = data.reduce((sum, d) => sum + d.value, 0);

export default function ResponderStatusDonut() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-light text-success">
          <ShieldCheck size={15} />
        </span>
        <h2 className="text-lg font-semibold text-foreground">Responder Status</h2>
      </div>

      <div className="relative mx-auto mt-3 h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
              </filter>
            </defs>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={55}
              outerRadius={78}
              paddingAngle={4}
              stroke="none"
              filter="url(#donutShadow)"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{total}</span>
          <span className="text-xs font-medium text-muted">Responders</span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        {data.map((entry) => (
          <div
            key={entry.name}
            className="flex items-center justify-between rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-background/60"
          >
            <span className="flex items-center gap-2 text-foreground">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white" style={{ backgroundColor: entry.color, boxShadow: `0 0 0 1px ${entry.color}33` }} />
              {entry.name}
            </span>
            <span className="font-medium text-muted">
              {entry.value} <span className="text-muted/70">({Math.round((entry.value / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/responders"
        className="mt-5 block w-full rounded-xl bg-linear-to-b from-primary to-primary-dark py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
      >
        View Responders
      </Link>
    </div>
  );
}
