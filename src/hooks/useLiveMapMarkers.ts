"use client";

import { useMemo } from "react";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useEvacuationCenters } from "@/hooks/useEvacuationCenters";
import type { LiveMapMarker } from "@/components/map/LiveMap";

// Responder markers would need live location tracking (User has no lat/lng
// field at all — mobile only uses on-device GPS transiently) — stays empty
// rather than fabricated.
export function useLiveMapMarkers() {
  const { emergencies, loading: emergenciesLoading, error: emergenciesError } = useEmergencies();
  const { centers, loading: centersLoading, error: centersError } = useEvacuationCenters();

  const markers = useMemo<LiveMapMarker[]>(() => {
    const incidentMarkers: LiveMapMarker[] = emergencies
      .filter((e) => e.latitude !== 0 && e.longitude !== 0)
      .map((e) => ({
        id: e.id,
        position: [e.latitude, e.longitude],
        label: `${e.type} — ${e.locationName}`,
        type: "incident",
      }));

    const evacuationMarkers: LiveMapMarker[] = centers.map((c) => ({
      id: c.id,
      position: [c.latitude, c.longitude],
      label: `${c.name} (${c.status === "full" ? "Full" : "Open"})`,
      type: "evacuation",
    }));

    return [...incidentMarkers, ...evacuationMarkers];
  }, [emergencies, centers]);

  return {
    markers,
    loading: emergenciesLoading || centersLoading,
    error: emergenciesError ?? centersError,
  };
}
