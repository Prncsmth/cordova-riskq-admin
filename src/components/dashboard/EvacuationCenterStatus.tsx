"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { useEvacuationCenters } from "@/hooks/useEvacuationCenters";

// Dashboard preview only — keeps this card's height in line with its row
// siblings (Responder Status, Quick Actions) instead of growing with the
// full center count. "Full" centers surface first since they're the ones
// actively handling an evacuation; see the full list at /evacuation-centers.
const PREVIEW_COUNT = 5;

export default function EvacuationCenterStatus() {
  const { centers, loading, error } = useEvacuationCenters();

  const previewCenters = useMemo(
    () =>
      [...centers]
        .sort((a, b) => Number(b.status === "full") - Number(a.status === "full"))
        .slice(0, PREVIEW_COUNT),
    [centers]
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-border/70 bg-surface p-6 text-center text-sm text-muted shadow-xs">
        Loading evacuation centers…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 shadow-xs">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-info-light text-info">
            <Building2 size={15} />
          </span>
          <h2 className="text-lg font-semibold text-foreground">Evacuation Center Status</h2>
        </div>
        <Link href="/evacuation-centers" className="text-sm font-medium text-primary hover:text-primary-dark">
          View All
        </Link>
      </div>

      <div className="mt-5 space-y-1">
        {previewCenters.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted">No evacuation centers yet.</p>
        ) : (
          previewCenters.map((center) => (
            <div
              key={center.id}
              className="flex items-center justify-between rounded-xl p-2.5 text-sm transition-colors hover:bg-background/60"
            >
              <span className="font-medium text-foreground">{center.name}</span>
              <Badge variant={center.status === "full" ? "danger" : "success"} solid={center.status === "full"}>
                {center.status === "full" ? "Full" : "Open"}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
