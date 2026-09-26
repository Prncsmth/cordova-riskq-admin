"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import { categoryToEmergencyType } from "@/lib/incidentCategory";
import type { HistoryRecord } from "@/hooks/useIncidentHistory";
import type { EmergencyType } from "@/types/emergency";

// Colors match IncidentTypeChart's type -> color mapping so the two charts
// read as one linked system when viewed together.
const TYPE_COLORS: Record<EmergencyType, string> = {
  Fire: "#dc2626",
  Medical: "#1d4ed8",
  Disaster: "#0891b2",
  Accident: "#b45309",
  Crime: "#c8102e",
  SOS: "#7c3aed",
  Other: "#6b7280",
};

export default function ResponseTimeByTypeChart({ records }: { records: HistoryRecord[] }) {
  const data = useMemo(() => {
    const secondsByType = new Map<EmergencyType, number[]>();

    for (const record of records) {
      if (record.responseTimeSeconds === null) continue;
      const type = categoryToEmergencyType(record.category);
      const list = secondsByType.get(type) ?? [];
      list.push(record.responseTimeSeconds);
      secondsByType.set(type, list);
    }

    return Array.from(secondsByType.entries()).map(([type, seconds]) => ({
      type,
      minutes: Number((seconds.reduce((sum, s) => sum + s, 0) / seconds.length / 60).toFixed(1)),
      color: TYPE_COLORS[type],
    }));
  }, [records]);

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <h2 className="text-lg font-semibold text-foreground">Response Time by Type</h2>
      <p className="text-sm text-muted">Average minutes from report to first responder arrival, by incident type</p>

      <div className="mt-6 h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState title="No resolved incidents with a recorded response time" />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
