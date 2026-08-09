"use client";

import CountUp from "react-countup";
import { motion } from "framer-motion";
import { AlertTriangle, BellRing, ShieldCheck, HeartHandshake, ArrowUp } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

// Mock data for UI — replace with real API data once backend endpoints are available.
const cards = [
  {
    title: "Active Incidents",
    value: 12,
    delta: "+3 from yesterday",
    color: "text-danger",
    bg: "bg-danger-light",
    stroke: "#dc2626",
    icon: AlertTriangle,
    trend: [4, 6, 5, 8, 7, 10, 12],
  },
  {
    title: "SOS Alerts Today",
    value: 28,
    delta: "+15 from yesterday",
    color: "text-warning",
    bg: "bg-warning-light",
    stroke: "#b45309",
    icon: BellRing,
    trend: [10, 14, 12, 18, 16, 22, 28],
  },
  {
    title: "Responders Online",
    value: 64,
    delta: "78% of total",
    color: "text-success",
    bg: "bg-success-light",
    stroke: "#15803d",
    icon: ShieldCheck,
    trend: [50, 54, 58, 55, 60, 62, 64],
  },
  {
    title: "People Assisted",
    value: 156,
    delta: "+23 from yesterday",
    color: "text-info",
    bg: "bg-info-light",
    stroke: "#1d4ed8",
    icon: HeartHandshake,
    trend: [90, 105, 110, 125, 130, 140, 156],
  },
];

export default function StatsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const trendData = card.trend.map((v) => ({ v }));

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-2xl border border-border bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">{card.title}</p>

                <h2 className="mt-2 text-3xl font-bold text-foreground">
                  <CountUp end={card.value} duration={1.5} />
                </h2>

                <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${card.color}`}>
                  <ArrowUp size={12} />
                  {card.delta}
                </p>
              </div>

              <div className={`rounded-full p-3 ${card.bg}`}>
                <Icon size={22} className={card.color} />
              </div>
            </div>

            <div className="mt-4 h-10 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id={`spark-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.stroke} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={card.stroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={card.stroke}
                    strokeWidth={2}
                    fill={`url(#spark-${index})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
