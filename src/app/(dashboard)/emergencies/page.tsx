"use client";

import { Siren, Radio, CheckCircle2, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import EmergencyTable from "@/components/emergencies/EmergencyTable";
import { useEmergenciesWithHistory } from "@/hooks/useEmergenciesWithHistory";

export default function EmergenciesPage() {
  const { emergencies, loading, error } = useEmergenciesWithHistory();

  const stats = [
    {
      label: "Active",
      value: emergencies.filter((e) => e.status === "Active").length,
      icon: Siren,
      color: "text-danger",
    },
    {
      label: "Responding",
      value: emergencies.filter((e) => e.status === "Responding").length,
      icon: Radio,
      color: "text-warning",
    },
    {
      label: "Resolved",
      value: emergencies.filter((e) => e.status === "Resolved").length,
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      label: "Cancelled",
      value: emergencies.filter((e) => e.status === "Cancelled").length,
      icon: XCircle,
      color: "text-muted",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Incidents</h1>

        <p className="mt-1 text-sm text-muted">
          Monitor and manage all emergency incidents.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4">
              <Icon size={22} className={`shrink-0 ${stat.color}`} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <EmergencyTable emergencies={emergencies} loading={loading} error={error} />
    </div>
  );
}
