"use client";

import CountUp from "react-countup";
import { motion } from "framer-motion";
import { AlertTriangle, BellRing, ShieldCheck, HeartHandshake } from "lucide-react";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useResponders } from "@/hooks/useResponders";

export default function StatsCards() {
  const { emergencies } = useEmergencies();
  const { responders } = useResponders();

  const activeIncidents = emergencies.filter((e) => e.status === "Active").length;

  const cards = [
    {
      title: "Active Incidents",
      value: activeIncidents,
      color: "text-danger",
      bg: "bg-danger-light",
      stroke: "#dc2626",
      icon: AlertTriangle,
    },
    {
      title: "SOS Alerts Today",
      value: null,
      color: "text-warning",
      bg: "bg-warning-light",
      stroke: "#b45309",
      icon: BellRing,
    },
    {
      title: "Total Responders",
      value: responders.length,
      color: "text-success",
      bg: "bg-success-light",
      stroke: "#1e8e3e",
      icon: ShieldCheck,
    },
    {
      title: "People Assisted",
      value: null,
      color: "text-info",
      bg: "bg-info-light",
      stroke: "#1d4ed8",
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
            style={{ borderLeftColor: card.stroke }}
            className="rounded-2xl border border-l-4 border-border/70 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
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

                <p className="mt-1 text-xs font-medium text-muted">
                  {card.value === null ? "Not tracked yet" : "Live"}
                </p>
              </div>

              <div className={`rounded-full p-3 ring-1 ring-black/3 ${card.bg}`}>
                <Icon size={22} className={card.color} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
