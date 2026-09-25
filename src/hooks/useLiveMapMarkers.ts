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
      // "Live" map -- only what's currently happening. useEmergencies()
      // returns every incident ever recorded (the full history the list
      // page filters client-side), so resolved/cancelled ones need
      // excluding here or they'd sit on the map forever.
      .filter((e) => e.status !== "Resolved" && e.status !== "Cancelled")
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

    // /admin/responders/en-route returns one row per (responder, incident)
    // pair -- a responder can be "on_the_way" on more than one active
    // incident at once, so the same responderId can appear more than once.
    // They only have one real position, so de-dupe to one marker each
    // rather than rendering overlapping pins (and colliding React keys).
    const seenResponderIds = new Set<string>();
    const responderMarkers: LiveMapMarker[] = responders
      .filter((r) => {
        if (seenResponderIds.has(r.responderId)) return false;
        seenResponderIds.add(r.responderId);
        return true;
      })
      .map((r) => ({
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
