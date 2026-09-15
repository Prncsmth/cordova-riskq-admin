"use client";

import { useMemo } from "react";
import { useEmergenciesWithHistory } from "@/hooks/useEmergenciesWithHistory";
import { useUserNames } from "@/hooks/useUserNames";
import { IncidentReport } from "@/types/incident-report";

export function useIncidentReports() {
  const { emergencies, loading: loadingEmergencies, error: emergenciesError } = useEmergenciesWithHistory();
  const { names, loading: loadingNames, error: namesError } = useUserNames();

  const reports = useMemo<IncidentReport[]>(() => {
    return emergencies.map((emergency) => ({
      id: emergency.id,
      type: emergency.type,
      locationName: emergency.locationName,
      submittedBy: names.get(emergency.userId) ?? "Unknown reporter",
      status: emergency.status,
      createdAt: emergency.createdAt,
    }));
  }, [emergencies, names]);

  return {
    reports,
    loading: loadingEmergencies || loadingNames,
    error: emergenciesError ?? namesError,
  };
}
