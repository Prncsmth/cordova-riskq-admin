"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
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

// Emergency Details' "View on Map" link passes the incident's own
// coordinates this way -- reading them straight from the URL is simpler
// and more reliable than looking the incident up by id in `markers`, which
// only ever holds non-terminal incidents (see useLiveMapMarkers), so a
// resolved/cancelled one being viewed would have no marker to find at all.
function LiveMapPageInner() {
  const { collapsed } = useSidebar();
  const { markers } = useLiveMapMarkers();
  const searchParams = useSearchParams();

  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const focusedCenter: [number, number] | undefined =
    Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0) ? [lat, lng] : undefined;

  // When the sidebar is collapsed, render the map as a fixed full-viewport
  // layer so it fills the entire screen width; keep the sidebar toggle
  // visible (it has a higher z-index) so the user can expand the sidebar.
  if (collapsed) {
    return (
      <div className="fixed inset-0 z-0 bg-background">
        <LiveMap markers={markers} center={focusedCenter} zoom={focusedCenter ? 17 : undefined} />
      </div>
    );
  }

  // Otherwise render the map to fill the available content area height.
  return (
    <div className="h-screen w-full">
      <LiveMap markers={markers} center={focusedCenter} zoom={focusedCenter ? 17 : undefined} />
    </div>
  );
}

export default function LiveMapPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-muted">Loading live map...</div>}>
      <LiveMapPageInner />
    </Suspense>
  );
}
