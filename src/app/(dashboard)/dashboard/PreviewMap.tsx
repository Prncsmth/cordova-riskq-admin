"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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

export default function LiveMapPreview() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between border-b border-border/70 p-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Live Map Overview</h2>
          <p className="text-sm text-muted">Active incidents, responders, and evacuation centers</p>
        </div>

        <Link
          href="/live-map"
          className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
        >
          View Full Map
          <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="h-80 w-full">
        <LiveMap />
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border/70 px-4 py-3 text-xs text-muted">
        <LegendDot color="bg-danger" label="Active Incident" />
        <LegendDot color="bg-info" label="Responder" />
        <LegendDot color="bg-success" label="Evacuation Center" />
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
