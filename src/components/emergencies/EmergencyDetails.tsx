"use client";

import dynamic from "next/dynamic";
import { MapPin, Clock, ShieldCheck, ShieldQuestion, Siren, MessageSquareText } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useEmergency } from "@/hooks/useEmergencies";
import { emergencyTypeStyles, defaultEmergencyTypeStyle, emergencyStatusStyle } from "@/lib/emergencyStyles";
import { timeAgo, formatDate } from "@/lib/utils";

const MiniMap = dynamic(() => import("@/components/map/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted">
      Loading map...
    </div>
  ),
});

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
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin size={15} className="text-muted" />
            {emergency.locationName}
          </div>

          {hasCoords && (
            <div className="mt-3 h-40 w-full overflow-hidden rounded-xl border border-border/70 shadow-xs">
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

      <Card>
        <h2 className="font-semibold text-foreground">Assigned Responder</h2>

        <div className="mt-5">
          {emergency.responderId ? (
            <div className="flex items-center gap-3">
              <ShieldCheck size={22} className="shrink-0 text-info" />
              <div className="min-w-0">
                <p className="font-medium text-foreground">{emergency.responderName ?? "Responder"}</p>
                <p className="text-xs text-muted">Currently assigned</p>
              </div>
            </div>
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
    </div>
  );
}
