"use client";

import dynamic from "next/dynamic";
import { useSidebar } from "@/components/layout/SidebarContext";

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
  const { collapsed } = useSidebar();

  if (collapsed) {
    return (
      <div className="fixed inset-0 z-40 bg-white">
        <LiveMap />
      </div>
    );
  }
  // When the sidebar is collapsed, render the map as a fixed full-viewport
  // layer so it fills the entire screen width; keep the sidebar toggle
  // visible (it has a higher z-index) so the user can expand the sidebar.
  if (collapsed) {
    return (
      <div className="fixed inset-0 z-0">
        <LiveMap />
      </div>
    );
  }

  // Otherwise render the map to fill the available content area height.
  return (
    <div className="h-screen w-full">
      <LiveMap />
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
