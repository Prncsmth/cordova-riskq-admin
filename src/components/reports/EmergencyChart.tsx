"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const data = [
  { month: "Mar", resolved: 40, investigating: 12, active: 6 },
  { month: "Apr", resolved: 46, investigating: 11, active: 7 },
  { month: "May", resolved: 52, investigating: 13, active: 6 },
  { month: "Jun", resolved: 44, investigating: 10, active: 6 },
  { month: "Jul", resolved: 61, investigating: 14, active: 7 },
  { month: "Aug", resolved: 55, investigating: 13, active: 8 },
];

export default function EmergencyChart() {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="text-lg font-semibold text-foreground">Emergency Status Overview</h2>
      <p className="text-sm text-muted">Monthly emergencies by resolution status</p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="resolved" name="Resolved" stackId="status" fill="#1e8e3e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="investigating" name="Investigating" stackId="status" fill="#b45309" radius={[0, 0, 0, 0]} />
            <Bar dataKey="active" name="Active" stackId="status" fill="#dc2626" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
