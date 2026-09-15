"use client";

import { useMemo } from "react";
import { ShieldCheck, ShieldHalf, ShieldOff } from "lucide-react";
import Card from "@/components/ui/Card";
import ResponderTable from "@/components/responders/ResponderTable";
import { useResponders } from "@/hooks/useResponders";

export default function RespondersPage() {
  const { responders, loading, error } = useResponders();

  const stats = useMemo(() => {
    const onDuty = responders.filter((r) => r.isOnDuty).length;
    return {
      total: responders.length,
      onDuty,
      offDuty: responders.length - onDuty,
    };
  }, [responders]);

  const statCards = [
    { label: "Total Responders", value: stats.total, icon: ShieldCheck, color: "text-primary", bg: "bg-primary-light" },
    { label: "On Duty", value: stats.onDuty, icon: ShieldHalf, color: "text-success", bg: "bg-success-light" },
    { label: "Off Duty", value: stats.offDuty, icon: ShieldOff, color: "text-muted", bg: "bg-background" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Responders</h1>

        <p className="text-sm text-muted">
          Monitor and manage emergency responders.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 sm:max-w-xl">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="flex items-center gap-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${card.bg} ${card.color}`}>
                <Icon size={19} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{card.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <ResponderTable responders={responders} loading={loading} error={error} />
    </div>
  );
}
