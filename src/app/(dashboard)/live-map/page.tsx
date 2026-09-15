"use client";

import dynamic from "next/dynamic";
import { useSidebar } from "@/components/layout/SidebarContext";
import { useLiveMapMarkers } from "@/hooks/useLiveMapMarkers";

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
  const { markers } = useLiveMapMarkers();

  // When the sidebar is collapsed, render the map as a fixed full-viewport
  // layer so it fills the entire screen width; keep the sidebar toggle
  // visible (it has a higher z-index) so the user can expand the sidebar.
  if (collapsed) {
    return (
      <div className="fixed inset-0 z-0 bg-background">
        <LiveMap markers={markers} />
      </div>
    );
  }

  // Otherwise render the map to fill the available content area height.
  return (
    <div className="h-screen w-full">
      <LiveMap markers={markers} />
    </div>
  );
}
