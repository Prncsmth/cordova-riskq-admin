"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const data = [
  { month: "Mar", alerts: 96 },
  { month: "Apr", alerts: 112 },
  { month: "May", alerts: 104 },
  { month: "Jun", alerts: 130 },
  { month: "Jul", alerts: 148 },
  { month: "Aug", alerts: 121 },
];

export default function SosAlertTrendChart() {
  return (
    <div className="rounded-2xl border border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h2 className="text-lg font-semibold text-foreground">SOS Alert Trend (6 Months)</h2>
      <p className="text-sm text-muted">Monthly SOS alert volume across Cordova</p>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="sosTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#b45309" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#b45309" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6e9eb", fontSize: 13 }} />
            <Area type="monotone" dataKey="alerts" name="SOS Alerts" stroke="#b45309" strokeWidth={2.5} fill="url(#sosTrend)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
