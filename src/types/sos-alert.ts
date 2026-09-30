export type SosAlertStatus = "New" | "Acknowledged" | "Resolved" | "Cancelled" | "Unattended";

export interface SosAlert {
  id: string;
  userName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  status: SosAlertStatus;
  // null for an alert with no incident (pre-mirroring, failed mirror write,
  // or deleted by the citizen) -- the backend closes those on the alert itself.
  incidentId: string | null;
  createdAt: string;
}
