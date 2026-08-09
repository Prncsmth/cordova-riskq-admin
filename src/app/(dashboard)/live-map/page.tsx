"use client";

import dynamic from "next/dynamic";

const LiveMap = dynamic(
  () => import("@/components/map/LiveMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted">
        Loading live map...
      </div>
    ),
  }
);

export default function LiveMapPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Map</h1>
        <p className="text-sm text-muted">
          Real-time view of active incidents, responders, and evacuation centers across Cordova.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="h-[calc(100vh-14rem)] min-h-[420px] w-full">
          <LiveMap />
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-border px-4 py-3 text-xs text-muted">
          <LegendDot color="bg-danger" label="Active Incident" />
          <LegendDot color="bg-info" label="Responder" />
          <LegendDot color="bg-success" label="Evacuation Center" />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
