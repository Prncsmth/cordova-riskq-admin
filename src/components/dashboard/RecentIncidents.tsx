"use client";

import Link from "next/link";
import { Siren } from "lucide-react";
import Badge from "@/components/ui/Badge";
import UnattendedBadge, { UNATTENDED_ROW_CLASS } from "@/components/emergencies/UnattendedBadge";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useNow } from "@/hooks/useNow";
import { isUnattendedIncident } from "@/lib/unattended";
import { timeAgo } from "@/lib/utils";

const statusVariant = {
  Active: "danger",
  Responding: "warning",
  Resolved: "success",
  Cancelled: "default",
  Expired: "info",
} as const;

export default function RecentIncidents() {
  const { emergencies, loading, error } = useEmergencies();
  const recent = emergencies.slice(0, 5);
  const now = useNow();

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-xs">
      <div className="flex items-center justify-between border-b border-border/70 p-5">
        <div className="flex items-center gap-2.5">
          <Siren size={18} className="shrink-0 text-danger" />
          <h2 className="text-lg font-semibold text-foreground">Recent Incidents</h2>
        </div>
        <Link href="/emergencies" className="text-sm font-medium text-primary hover:text-primary-dark">
          View All
        </Link>
      </div>

      {loading ? (
        <p className="p-10 text-center text-sm text-muted">Loading incidents…</p>
      ) : error ? (
        <p className="p-10 text-center text-sm text-red-700">{error}</p>
      ) : recent.length === 0 ? (
        <p className="p-10 text-center text-sm text-muted">No active incidents.</p>
      ) : (
        <div className="max-h-[420px] overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/60">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary">Type</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary">Location</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary">Time</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-text-tertiary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {recent.map((incident) => {
                const unattended = isUnattendedIncident(incident, now);
                return (
                  <tr
                    key={incident.id}
                    className={`transition-colors hover:bg-background/70 ${unattended ? UNATTENDED_ROW_CLASS : ""}`}
                  >
                    <td className="p-4 font-medium text-foreground">{incident.type}</td>
                    <td className="p-4 text-muted">{incident.locationName}</td>
                    <td className="p-4 text-muted">{timeAgo(incident.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={statusVariant[incident.status]} solid={incident.status === "Active"}>
                          {incident.status}
                        </Badge>
                        {unattended && <UnattendedBadge />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
