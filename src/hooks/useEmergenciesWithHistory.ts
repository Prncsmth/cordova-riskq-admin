"use client";

import { useEffect, useMemo, useState } from "react";
import { toEmergency as liveIncidentToEmergency, useEmergencies, type RawIncident } from "@/hooks/useEmergencies";
import { useIncidentHistory, type HistoryRecord } from "@/hooks/useIncidentHistory";
import { useSocket } from "@/hooks/useSocket";
import { categoryToEmergencyType } from "@/lib/incidentCategory";
import { HISTORY_EMERGENCY_STATUSES, mergeEmergencyLists } from "@/lib/mergeEmergencyLists";
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
    responderName: respondedBy?.name,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// useEmergencies() alone only ever returns non-terminal incidents (that's all
// GET /incidents exposes). This adds completed/cancelled ones from
// GET /admin/history so "Resolved"/"Cancelled" status filters actually work.
export function useEmergenciesWithHistory() {
  const socket = useSocket();
  const { emergencies, loading: loadingLive, error: liveError } = useEmergencies();
  const { records, loading: loadingHistory, error: historyError } = useIncidentHistory();
  // Incidents that closed while this page was open. useEmergencies drops a
  // closed incident from the live list, and the history above is a one-time
  // load -- without this, a report a responder just resolved vanished from
  // the list until the next reload instead of reading "Resolved".
  const [closedLive, setClosedLive] = useState<Map<string, Emergency>>(() => new Map());

  useEffect(() => {
    function handleIncidentUpdate(raw: RawIncident) {
      const emergency = liveIncidentToEmergency(raw);
      if (!HISTORY_EMERGENCY_STATUSES.includes(emergency.status)) return;
      setClosedLive((prev) => new Map(prev).set(emergency.id, emergency));
    }

    socket.on("admin:incidentUpdate", handleIncidentUpdate);
    return () => {
      socket.off("admin:incidentUpdate", handleIncidentUpdate);
    };
  }, [socket]);

  const allEmergencies = useMemo<Emergency[]>(
    () => mergeEmergencyLists(emergencies, records.map(toEmergency), [...closedLive.values()]),
    [emergencies, records, closedLive],
  );

  return {
    emergencies: allEmergencies,
    loading: loadingLive || loadingHistory,
    error: liveError ?? historyError,
  };
}
