"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import type { Emergency, EmergencyType } from "@/types/emergency";

const TYPE_COLORS: Record<EmergencyType, string> = {
  Fire: "#dc2626",
  Medical: "#1d4ed8",
  Disaster: "#0891b2",
  Accident: "#b45309",
  Crime: "#c8102e",
  Other: "#6b7280",
};

export default function IncidentTypeChart({ emergencies }: { emergencies: Emergency[] }) {
  const data = useMemo(() => {
    const counts = new Map<EmergencyType, number>();
    for (const e of emergencies) {
      counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([type, count]) => ({
      type,
      count,
      color: TYPE_COLORS[type],
    }));
  }, [emergencies]);

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <h2 className="text-lg font-semibold text-foreground">Incidents by Type</h2>
      <p className="text-sm text-muted">Breakdown of incident categories for the selected period</p>

      <div className="mt-6 h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState title="No incidents in this period" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" />
              <XAxis dataKey="type" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
