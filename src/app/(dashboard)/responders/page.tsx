"use client";

import { useState } from "react";
import { ShieldCheck, ShieldHalf, ShieldOff } from "lucide-react";
import Card from "@/components/ui/Card";
import ResponderTable from "@/components/responders/ResponderTable";
import { useResponders, useResponderSummary } from "@/hooks/useResponders";
import { usePaginationState } from "@/hooks/usePaginationState";
import type { ResponderUnit } from "@/types/responder";

type DutyFilter = "all" | "on-duty" | "off-duty";
type UnitFilter = "all" | ResponderUnit | "unclassified";

export default function RespondersPage() {
  const pagination = usePaginationState();
  const [dutyFilter, setDutyFilter] = useState<DutyFilter>("all");
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("all");

  const { responders, total, loading, error } = useResponders(pagination, {
    duty: dutyFilter,
    unit: unitFilter,
  });
  const { summary } = useResponderSummary();
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  function handleDutyFilterChange(value: DutyFilter) {
    setDutyFilter(value);
    pagination.resetPage();
  }

  function handleUnitFilterChange(value: UnitFilter) {
    setUnitFilter(value);
    pagination.resetPage();
  }

  const statCards = [
    { label: "Total Responders", value: summary?.total ?? 0, icon: ShieldCheck, color: "text-primary", bg: "bg-primary-light" },
    { label: "On Duty", value: summary?.onDuty ?? 0, icon: ShieldHalf, color: "text-success", bg: "bg-success-light" },
    { label: "Off Duty", value: summary?.offDuty ?? 0, icon: ShieldOff, color: "text-muted", bg: "bg-background" },
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

      <ResponderTable
        responders={responders}
        loading={loading}
        error={error}
        searchInput={pagination.searchInput}
        onSearchChange={pagination.setSearchInput}
        dutyFilter={dutyFilter}
        onDutyFilterChange={handleDutyFilterChange}
        unitFilter={unitFilter}
        onUnitFilterChange={handleUnitFilterChange}
        page={pagination.page}
        totalPages={totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </div>
  );
}
