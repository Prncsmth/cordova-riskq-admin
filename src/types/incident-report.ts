export type IncidentReportStatus = "Draft" | "Submitted" | "Reviewed";

export interface IncidentReport {
  id: string;
  incidentId: string;
  type: string;
  submittedBy: string;
  status: IncidentReportStatus;
  createdAt: string;
}
