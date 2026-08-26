import type { EmergencyStatus, EmergencyType } from "@/types/emergency";

export interface IncidentReport {
  id: string;
  type: EmergencyType;
  locationName: string;
  submittedBy: string;
  status: EmergencyStatus;
  createdAt: string;
}
