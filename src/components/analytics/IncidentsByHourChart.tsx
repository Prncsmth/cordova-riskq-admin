"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const data = [
  { hour: "12am", incidents: 3 }, { hour: "2am", incidents: 2 }, { hour: "4am", incidents: 1 },
  { hour: "6am", incidents: 4 }, { hour: "8am", incidents: 9 }, { hour: "10am", incidents: 12 },
  { hour: "12pm", incidents: 14 }, { hour: "2pm", incidents: 11 }, { hour: "4pm", incidents: 13 },
  { hour: "6pm", incidents: 16 }, { hour: "8pm", incidents: 10 }, { hour: "10pm", incidents: 6 },
];

export default function IncidentsByHourChart() {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="text-lg font-semibold text-foreground">Incidents by Time of Day</h2>
      <p className="text-sm text-muted">Peak reporting hours across the selected period</p>

      <div className="mt-6 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }} />
            <Bar dataKey="incidents" name="Incidents" fill="#c8102e" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
