"use client";

import CountUp from "react-countup";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Ambulance,
  Users,
  CheckCircle2,
} from "lucide-react";

const cards = [
  {
    title: "Active Emergencies",
    value: 12,
    color: "text-red-600",
    bg: "bg-red-50",
    icon: AlertTriangle,
  },
  {
    title: "Responders Online",
    value: 36,
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: Ambulance,
  },
  {
    title: "Citizens Assisted",
    value: 153,
    color: "text-green-600",
    bg: "bg-green-50",
    icon: Users,
  },
  {
    title: "Resolved Cases",
    value: 124,
    color: "text-purple-600",
    bg: "bg-purple-50",
    icon: CheckCircle2,
  },
];

export default function StatsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {cards.map((card, index) => {

        const Icon = card.icon;

        return (

          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2 className={`mt-2 text-4xl font-bold ${card.color}`}>

                  <CountUp
                    end={card.value}
                    duration={2}
                  />

                </h2>

              </div>

              <div className={`rounded-full p-4 ${card.bg}`}>

                <Icon
                  size={32}
                  className={card.color}
                />

              </div>

            </div>

          </motion.div>

        );
      })}
    </div>
  );
}