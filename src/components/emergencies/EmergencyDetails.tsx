"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ShieldCheck,
  ShieldQuestion,
  Siren,
  MessageSquareText,
  Maximize2,
  Users,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import { useEmergency } from "@/hooks/useEmergencies";
import { useResponders } from "@/hooks/useResponders";
import { usePaginationState } from "@/hooks/usePaginationState";
import { getNearestBarangay } from "@/lib/cordovaBarangays";
import { emergencyTypeStyles, defaultEmergencyTypeStyle, emergencyStatusStyle } from "@/lib/emergencyStyles";
import { timeAgo, formatDate } from "@/lib/utils";
import type { Emergency } from "@/types/emergency";
import type { LucideIcon } from "lucide-react";

const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted">
      Loading map...
    </div>
  ),
});

// Each responder's own roster step (backend IncidentResponder.status), shown
// per row -- the incident-level "Responding" badge can't say who is where.
const responderStepStyle: Record<string, { label: string; variant: BadgeVariant; color: string }> = {
  joined: { label: "Joined", variant: "info", color: "text-info" },
  on_the_way: { label: "On the way", variant: "warning", color: "text-warning" },
  arrived: { label: "Arrived", variant: "success", color: "text-success" },
};

const defaultResponderStep = { label: "Assigned", variant: "default" as BadgeVariant, color: "text-muted" };

export default function EmergencyDetails({
  id,
}: {
  id: string;
}) {
  const { emergency, loading, error } = useEmergency(id);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted shadow-sm">
        Loading incident…
      </div>
    );
  }

  if (error || !emergency) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-sm text-red-700 shadow-sm">
        {error ?? "Incident not found."}
      </div>
    );
  }

  const style = emergencyTypeStyles[emergency.type] ?? defaultEmergencyTypeStyle;
  const Icon = style.icon;
  const status = emergencyStatusStyle[emergency.status];
  const hasCoords = emergency.latitude !== 0 && emergency.longitude !== 0;
  const responders = emergency.responders ?? [];
  const assignedIds = new Set(responders.map((r) => r.id));

  // Nearest-barangay-by-distance, same approximation the mobile app uses to
  // label a live location -- good enough to surface "who else covers this
  // area," not precise enough to be an authoritative boundary check.
  const nearestBarangay = hasCoords
    ? getNearestBarangay(emergency.latitude, emergency.longitude)
    : null;

  return <EmergencyDetailsView emergency={emergency} style={style} Icon={Icon} status={status} hasCoords={hasCoords} responders={responders} assignedIds={assignedIds} nearestBarangay={nearestBarangay} />;
}

function EmergencyDetailsView({
  emergency,
  style,
  Icon,
  status,
  hasCoords,
  responders,
  assignedIds,
  nearestBarangay,
}: {
  emergency: Emergency;
  style: { color: string };
  Icon: LucideIcon;
  status: { variant: BadgeVariant; solid: boolean };
  hasCoords: boolean;
  responders: { id: string; name: string; status: string }[];
  assignedIds: Set<string>;
  nearestBarangay: { id: string; name: string } | null;
}) {
  const barangayPagination = usePaginationState(50);
  const { responders: barangayResponders, loading: barangayLoading } = useResponders(barangayPagination, {
    duty: "all",
    unit: "all",
    barangay: nearestBarangay?.name ?? "__none__",
  });
  const nearbyResponders = barangayResponders.filter((r) => !assignedIds.has(r.id));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="flex items-start gap-4">
          <Icon size={32} className={`mt-1 shrink-0 ${style.color}`} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{emergency.type}</h2>
              <Badge variant={status.variant} solid={status.solid}>
                {emergency.status}
              </Badge>
              {emergency.source === "sos" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-xs">
                  <Siren size={11} />
                  SOS
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-text-tertiary">
              {emergency.id} &middot; Reported {timeAgo(emergency.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border/70 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin size={15} className="shrink-0 text-muted" />
              <span className="truncate">{emergency.locationName}</span>
            </div>

            {hasCoords && (
              <Link
                href={`/live-map?lat=${emergency.latitude}&lng=${emergency.longitude}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs transition-all duration-150 hover:bg-primary-light/40 active:scale-[0.97]"
              >
                <Maximize2 size={13} />
                View on Map
              </Link>
            )}
          </div>

          {hasCoords && (
            <div className="mt-3 h-48 w-full overflow-hidden rounded-xl border border-border/70 shadow-xs">
              <MiniMap latitude={emergency.latitude} longitude={emergency.longitude} label={emergency.locationName} />
            </div>
          )}
        </div>

        {emergency.description && (
          <div className="mt-6 rounded-xl border border-border/70 bg-background/60 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-tertiary">
              <MessageSquareText size={13} />
              Details
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{emergency.description}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border/70 pt-5">
          <div className="flex items-center gap-2 rounded-xl bg-background/60 px-3 py-2 text-xs text-muted">
            <Clock size={13} />
            Reported {formatDate(emergency.createdAt)}
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-background/60 px-3 py-2 text-xs text-muted">
            <Clock size={13} />
            Updated {formatDate(emergency.updatedAt)}
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <h2 className="font-semibold text-foreground">
            Assigned Responder{responders.length > 1 ? `s (${responders.length})` : ""}
          </h2>

          <div className="mt-5">
            {responders.length > 0 ? (
              <ul className="space-y-4">
                {responders.map((responder) => {
                  const step = responderStepStyle[responder.status] ?? defaultResponderStep;
                  return (
                    <li key={responder.id} className="flex items-center gap-3">
                      <ShieldCheck size={22} className={`shrink-0 ${step.color}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{responder.name}</p>
                        <p className="text-xs text-muted">
                          {responder.id === emergency.responderId ? "First to accept" : "Joined to help"}
                        </p>
                      </div>
                      <Badge variant={step.variant}>{step.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex items-center gap-3">
                <ShieldQuestion size={22} className="shrink-0 text-muted" />
                <div>
                  <p className="text-sm font-medium text-foreground">Unassigned</p>
                  <p className="text-xs text-muted">No responder assigned yet.</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {nearestBarangay && (
          <Card>
            <div className="flex items-center gap-2">
              <Users size={16} className="shrink-0 text-muted" />
              <h2 className="font-semibold text-foreground">Responders near {nearestBarangay.name}</h2>
            </div>

            <div className="mt-5">
              {barangayLoading ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : nearbyResponders.length > 0 ? (
                <ul className="space-y-3">
                  {nearbyResponders.map((responder) => (
                    <li key={responder.id} className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${responder.isOnDuty ? "bg-success" : "bg-muted"}`}
                      />
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{responder.name}</p>
                      <Badge variant={responder.isOnDuty ? "success" : "default"}>
                        {responder.isOnDuty ? "On Duty" : "Off Duty"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">
                  No responders assigned to {nearestBarangay.name} yet.
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
