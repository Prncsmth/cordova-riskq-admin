"use client";

import CountUp from "react-countup";
import { motion } from "framer-motion";
import { AlertTriangle, BellRing, ShieldCheck, HeartHandshake } from "lucide-react";
import { useEmergenciesWithHistory } from "@/hooks/useEmergenciesWithHistory";
import { useResponderSummary } from "@/hooks/useResponders";
import { isToday } from "@/lib/utils";

export default function StatsCards() {
  const { emergencies } = useEmergenciesWithHistory();
  const { summary } = useResponderSummary();

  const activeIncidents = emergencies.filter((e) => e.status === "Active").length;
  const sosAlertsToday = emergencies.filter((e) => e.source === "sos" && isToday(e.createdAt)).length;

  const cards = [
    {
      title: "Active Incidents",
      value: activeIncidents,
      color: "text-danger",
      icon: AlertTriangle,
    },
    {
      title: "SOS Alerts Today",
      value: sosAlertsToday,
      color: "text-warning",
      icon: BellRing,
    },
    {
      title: "Total Responders",
      value: summary?.total ?? 0,
      color: "text-success",
      icon: ShieldCheck,
    },
    {
      title: "People Assisted",
      value: null,
      color: "text-info",
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted">{card.title}</p>

                <h2 className="mt-2 text-3xl font-bold text-foreground">
                  {card.value === null ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <CountUp end={card.value} duration={1.5} />
                  )}
                </h2>

                <p className="mt-1 text-xs font-medium text-text-tertiary">
                  {card.value === null ? "Not tracked yet" : "Live"}
                </p>
              </div>

              <Icon size={26} className={`shrink-0 ${card.color}`} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
