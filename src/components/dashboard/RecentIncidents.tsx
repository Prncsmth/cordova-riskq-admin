"use client";

import Link from "next/link";
import { Siren } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { useEmergencies } from "@/hooks/useEmergencies";
import { timeAgo } from "@/lib/utils";

const statusVariant = {
  Active: "danger",
  Responding: "warning",
  Resolved: "success",
  Cancelled: "default",
} as const;

export default function RecentIncidents() {
  const { emergencies, loading, error } = useEmergencies();
  const recent = emergencies.slice(0, 5);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border/70 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger-light text-danger">
            <Siren size={15} />
          </span>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/60">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Type</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Location</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Time</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {recent.map((incident) => (
                <tr key={incident.id} className="transition-colors hover:bg-background/70">
                  <td className="p-4 font-medium text-foreground">{incident.type}</td>
                  <td className="p-4 text-muted">{incident.locationName}</td>
                  <td className="p-4 text-muted">{timeAgo(incident.createdAt)}</td>
                  <td className="p-4">
                    <Badge variant={statusVariant[incident.status]} solid={incident.status === "Active"}>
                      {incident.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
