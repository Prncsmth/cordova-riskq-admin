"use client";

import { Building2, CheckCircle2, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import EvacuationCenterList from "@/components/evacuation-centers/EvacuationCenterList";
import { useEvacuationCenters } from "@/hooks/useEvacuationCenters";

export default function EvacuationCentersPage() {
  const { centers, loading, error, actionError, updateCenter } = useEvacuationCenters();

  const open = centers.filter((c) => c.status === "open").length;
  const full = centers.length - open;

  const stats = [
    { label: "Total Centers", value: centers.length, icon: Building2, color: "text-primary" },
    { label: "Open", value: open, icon: CheckCircle2, color: "text-success" },
    { label: "Full", value: full, icon: XCircle, color: "text-danger" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Evacuation Centers</h1>
        <p className="text-sm text-muted">
          Monitor status and utilities across evacuation centers.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4 shadow-md">
              <Icon size={22} className={`shrink-0 ${stat.color}`} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <EvacuationCenterList
        centers={centers}
        loading={loading}
        error={error}
        actionError={actionError}
        updateCenter={updateCenter}
      />
    </div>
  );
}
