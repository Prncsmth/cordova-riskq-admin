export type SosAlertStatus = "New" | "Acknowledged" | "Resolved";

export interface SosAlert {
  id: string;
  userName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  status: SosAlertStatus;
  receivedAt: string;
}
