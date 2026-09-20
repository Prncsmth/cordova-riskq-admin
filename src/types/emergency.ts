export type EmergencyStatus =
  | "Active"
  | "Responding"
  | "Resolved"
  | "Cancelled";

export type EmergencyType =
  | "Medical"
  | "Fire"
  | "Accident"
  | "Crime"
  | "Disaster"
  | "Other";

export interface Emergency {
  id: string;
  type: EmergencyType;
  description?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  status: EmergencyStatus;
  source: "report" | "sos";
  userId: string;
  responderId?: string;
  responderName?: string;
  createdAt: string;
  updatedAt: string;
}