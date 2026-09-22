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
  // Every responder currently active on this incident's roster (joined
  // through arrived, per the backend's multi-responder model) -- responderId
  // above is only ever the single legacy "accepted" responder, so a page
  // like ResponderDetails that needs to know "is this responder working this
  // incident" must check this list, not just responderId.
  responderIds?: string[];
  createdAt: string;
  updatedAt: string;
}