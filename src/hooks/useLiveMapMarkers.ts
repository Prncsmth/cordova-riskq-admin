"use client";

import { useMemo } from "react";
import { useEmergencies } from "@/hooks/useEmergencies";
import type { LiveMapMarker } from "@/components/map/LiveMap";

// Only incident markers are wired to real data. Responder markers would need
// live location tracking (User has no lat/lng field at all — mobile only
// uses on-device GPS transiently) and evacuation center markers would need a
// backend model (none exists yet) — both stay empty rather than fabricated.
export function useLiveMapMarkers() {
  const { emergencies, loading, error } = useEmergencies();

  const markers = useMemo<LiveMapMarker[]>(() => {
    return emergencies
      .filter((e) => e.latitude !== 0 && e.longitude !== 0)
      .map((e) => ({
        id: e.id,
        position: [e.latitude, e.longitude],
        label: `${e.type} — ${e.locationName}`,
        type: "incident",
      }));
  }, [emergencies]);

  return { markers, loading, error };
}
