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
  userId: string;
  responderId?: string;
  createdAt: string;
  updatedAt: string;
}