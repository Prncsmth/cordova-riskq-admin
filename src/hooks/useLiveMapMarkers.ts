"use client";

import { useMemo } from "react";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useEvacuationCenters } from "@/hooks/useEvacuationCenters";
import { useResponderLocations } from "@/hooks/useResponderLocations";
import type { LiveMapMarker } from "@/components/map/LiveMap";

// Responder markers only cover responders currently en route to a
// non-terminal incident -- that's the only time the backend has a fresh
// location for them (see useResponderLocations). Idle on-duty responders
// intentionally have no marker.
export function useLiveMapMarkers() {
  const { emergencies, loading: emergenciesLoading, error: emergenciesError } = useEmergencies();
  const { centers, loading: centersLoading, error: centersError } = useEvacuationCenters();
  const { responders, loading: respondersLoading, error: respondersError } = useResponderLocations();

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

    const responderMarkers: LiveMapMarker[] = responders.map((r) => ({
      id: r.responderId,
      position: [r.latitude, r.longitude],
      label: `${r.responderName} — En Route`,
      type: "responder",
    }));

    return [...incidentMarkers, ...evacuationMarkers, ...responderMarkers];
  }, [emergencies, centers, responders]);

  return {
    markers,
    loading: emergenciesLoading || centersLoading || respondersLoading,
    error: emergenciesError ?? centersError ?? respondersError,
  };
}
