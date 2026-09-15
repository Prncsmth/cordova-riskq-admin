"use client";

import { useMemo } from "react";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useIncidentHistory, type HistoryRecord } from "@/hooks/useIncidentHistory";
import { categoryToEmergencyType } from "@/lib/incidentCategory";
import type { Emergency } from "@/types/emergency";

function toEmergency(record: HistoryRecord): Emergency {
  const respondedBy = record.responders.find((r) => r.status !== "declined");

  return {
    id: record.id,
    type: categoryToEmergencyType(record.category),
    latitude: record.latitude ?? 0,
    longitude: record.longitude ?? 0,
    locationName: record.locationLabel,
    status: record.status === "completed" ? "Resolved" : "Cancelled",
    source: record.source === "sos" ? "sos" : "report",
    userId: record.reporter.id,
    responderId: respondedBy?.id,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// useEmergencies() alone only ever returns non-terminal incidents (that's all
// GET /incidents exposes). This adds completed/cancelled ones from
// GET /admin/history so "Resolved"/"Cancelled" status filters actually work.
export function useEmergenciesWithHistory() {
  const { emergencies, loading: loadingLive, error: liveError } = useEmergencies();
  const { records, loading: loadingHistory, error: historyError } = useIncidentHistory();

  const allEmergencies = useMemo<Emergency[]>(() => {
    return [...emergencies, ...records.map(toEmergency)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [emergencies, records]);

  return {
    emergencies: allEmergencies,
    loading: loadingLive || loadingHistory,
    error: liveError ?? historyError,
  };
}
