"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const data = [
  { week: "Wk 1", minutes: 10.2 },
  { week: "Wk 2", minutes: 9.4 },
  { week: "Wk 3", minutes: 9.8 },
  { week: "Wk 4", minutes: 8.9 },
  { week: "Wk 5", minutes: 8.1 },
  { week: "Wk 6", minutes: 8.4 },
];

export default function ResponseTimeChart() {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="text-lg font-semibold text-foreground">Average Response Time</h2>
      <p className="text-sm text-muted">Minutes from report to first responder dispatch</p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              unit=" min"
              width={64}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }}
              formatter={(value) => [`${value} min`, "Avg. response"]}
            />
            <Line
              type="monotone"
              dataKey="minutes"
              name="Avg. response"
              stroke="#0e7b86"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#0e7b86" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
