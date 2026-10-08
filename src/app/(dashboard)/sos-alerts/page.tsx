"use client";

import { useState } from "react";
import { BellRing, CheckCheck, Hourglass, ShieldCheck, Siren, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import SosAlertTable from "@/components/sos-alerts/SosAlertTable";
import { closeSosAlert, useSosAlerts, useSosAlertSummary } from "@/hooks/useSosAlerts";
import { useAuth } from "@/hooks/useAuth";
import { usePaginationState } from "@/hooks/usePaginationState";
import type { SosAlert, SosAlertStatus } from "@/types/sos-alert";

const CLOSE_CONFIRM_COPY = {
  resolved: "Mark this SOS alert as resolved? Use this when it was handled outside the app (e.g. by phone).",
  dismissed: "Dismiss this SOS alert? Use this for a false alarm or duplicate.",
};

export default function SosAlertsPage() {
  const { token } = useAuth();
  const pagination = usePaginationState();
  const [statusFilter, setStatusFilter] = useState<"All" | SosAlertStatus>("All");
  // Bumped after an admin close so the list and summary cards refetch.
  const [reloadKey, setReloadKey] = useState(0);
  const [closingAlertId, setClosingAlertId] = useState<string | null>(null);

  const { alerts, total, loading, error } = useSosAlerts(pagination, statusFilter, reloadKey);
  const { summary } = useSosAlertSummary(reloadKey);
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  function handleStatusFilterChange(value: "All" | SosAlertStatus) {
    setStatusFilter(value);
    pagination.resetPage();
  }

  async function handleCloseAlert(alert: SosAlert, outcome: "resolved" | "dismissed") {
    if (!token || !window.confirm(CLOSE_CONFIRM_COPY[outcome])) return;

    setClosingAlertId(alert.id);
    try {
      await closeSosAlert(token, alert.id, outcome);
      setReloadKey((key) => key + 1);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to close SOS alert.");
    } finally {
      setClosingAlertId(null);
    }
  }

  const stats = [
    {
      label: "Total Alerts",
      value: String(summary?.total ?? 0),
      icon: Siren,
      color: "text-primary",
    },
    {
      label: "New",
      value: String(summary?.New ?? 0),
      icon: BellRing,
      color: "text-danger",
    },
    {
      label: "Acknowledged",
      value: String(summary?.Acknowledged ?? 0),
      icon: CheckCheck,
      color: "text-warning",
    },
    {
      // Backend "expired" bucket (keyed "Unattended" in the summary).
      label: "Expired",
      value: String(summary?.Unattended ?? 0),
      icon: Hourglass,
      color: "text-info",
    },
    {
      label: "Resolved",
      value: String(summary?.Resolved ?? 0),
      icon: ShieldCheck,
      color: "text-success",
    },
    {
      label: "Cancelled",
      value: String(summary?.Cancelled ?? 0),
      icon: XCircle,
      color: "text-muted",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SOS Alerts</h1>
        <p className="text-sm text-muted">
          Emergency SOS alerts received from citizens across Cordova.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

      <SosAlertTable
        alerts={alerts}
        loading={loading}
        error={error}
        searchInput={pagination.searchInput}
        onSearchChange={pagination.setSearchInput}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        page={pagination.page}
        totalPages={totalPages}
        pageSize={pagination.pageSize}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
        onCloseAlert={handleCloseAlert}
        closingAlertId={closingAlertId}
      />
    </div>
  );
}
