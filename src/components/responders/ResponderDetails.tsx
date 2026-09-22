"use client";

import Link from "next/link";
import { Mail, Phone, Building2, Calendar, Siren, History } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { useResponder } from "@/hooks/useResponders";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useIncidentHistory } from "@/hooks/useIncidentHistory";
import { categoryToEmergencyType } from "@/lib/incidentCategory";
import { formatMinutes } from "@/lib/incidentStats";
import { formatDate, timeAgo } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ResponderDetails({
  id,
}: {
  id: string;
}) {
  const { responder, loading, error } = useResponder(id);
  const { emergencies, loading: emergenciesLoading, error: emergenciesError } = useEmergencies();
  const { records: history, loading: historyLoading, error: historyError } = useIncidentHistory({ responderId: id });

  // e.responderId is only the single legacy "accepted" responder -- check
  // the full active roster (responderIds) so a non-primary responder who
  // joined via the multi-responder model still sees their own assignment.
  const currentAssignments = emergencies.filter((e) => e.responderIds?.includes(id));

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading responder…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (!responder) {
    return (
      <EmptyState
        title="Responder not found"
        description={`No responder matches "${id}". They may have been reverted to citizen.`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-5">
          <div
            className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-xs ${
              responder.isOnDuty ? "bg-success" : "bg-muted"
            }`}
          >
            {initials(responder.name)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-foreground">{responder.name}</h2>
            <p className="text-sm text-muted">
              {responder.unit ?? "Unclassified"} &middot; Joined {timeAgo(responder.createdAt)}
            </p>
          </div>

          <Badge variant={responder.isOnDuty ? "success" : "default"}>
            {responder.isOnDuty ? "On Duty" : "Off Duty"}
          </Badge>
        </div>

        <div className="mt-8 grid gap-5 border-t border-border/70 pt-6 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <Mail size={16} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium text-foreground">{responder.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Phone size={16} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-xs text-muted">Contact</p>
              <p className="text-sm font-medium text-foreground">{responder.phone ?? "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Building2 size={16} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-xs text-muted">Unit</p>
              <p className="text-sm font-medium text-foreground">{responder.unit ?? "Unclassified"}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar size={16} className="mt-0.5 shrink-0 text-muted" />
            <div>
              <p className="text-xs text-muted">Joined</p>
              <p className="text-sm font-medium text-foreground">{formatDate(responder.createdAt)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2.5">
          <Siren size={18} className="shrink-0 text-danger" />
          <h2 className="font-semibold text-foreground">Current Assignment</h2>
        </div>

        <div className="mt-5">
          {emergenciesLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : emergenciesError ? (
            <p className="text-sm text-red-700">{emergenciesError}</p>
          ) : currentAssignments.length === 0 ? (
            <p className="text-sm text-muted">Not currently assigned to an active incident.</p>
          ) : (
            <div className="divide-y divide-border/70">
              {currentAssignments.map((e) => (
                <Link
                  key={e.id}
                  href={`/emergencies/${e.id}`}
                  className="flex items-center justify-between py-3 text-sm transition-colors hover:bg-background/60"
                >
                  <div>
                    <p className="font-medium text-foreground">{e.type}</p>
                    <p className="text-muted">{e.locationName}</p>
                  </div>
                  <Badge variant={e.status === "Active" ? "danger" : "warning"}>{e.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2.5">
          <History size={18} className="shrink-0 text-primary" />
          <h2 className="font-semibold text-foreground">Past Incidents</h2>
        </div>

        <div className="mt-5">
          {historyLoading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : historyError ? (
            <p className="text-sm text-red-700">{historyError}</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted">No past incidents recorded for this responder.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    <th className="pb-2 pr-4">Type</th>
                    <th className="pb-2 pr-4">Location</th>
                    <th className="pb-2 pr-4">Response Time</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {history.map((record) => (
                    <tr key={record.id}>
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {categoryToEmergencyType(record.category)}
                      </td>
                      <td className="py-3 pr-4 text-muted">{record.locationLabel}</td>
                      <td className="py-3 pr-4 text-muted">
                        {record.responseTimeSeconds !== null ? formatMinutes(record.responseTimeSeconds) : "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted">{formatDate(record.createdAt)}</td>
                      <td className="py-3">
                        <Badge variant={record.status === "completed" ? "success" : "default"}>
                          {record.status === "completed" ? "Resolved" : "Cancelled"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
