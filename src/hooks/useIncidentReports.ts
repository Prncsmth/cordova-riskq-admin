"use client";

import { useMemo } from "react";
import { useEmergencies } from "@/hooks/useEmergencies";
import { useUsers } from "@/hooks/useUsers";
import { IncidentReport } from "@/types/incident-report";

export function useIncidentReports() {
  const { emergencies, loading: loadingEmergencies, error: emergenciesError } = useEmergencies();
  const { users, loading: loadingUsers, error: usersError } = useUsers();

  const reports = useMemo<IncidentReport[]>(() => {
    const nameById = new Map(users.map((u) => [u.id, u.name || u.email]));

    return emergencies.map((emergency) => ({
      id: emergency.id,
      type: emergency.type,
      locationName: emergency.locationName,
      submittedBy: nameById.get(emergency.userId) ?? "Unknown reporter",
      status: emergency.status,
      createdAt: emergency.createdAt,
    }));
  }, [emergencies, users]);

  return {
    reports,
    loading: loadingEmergencies || loadingUsers,
    error: emergenciesError ?? usersError,
  };
}
