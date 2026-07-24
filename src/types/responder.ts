export type ResponderStatus =
  | "Available"
  | "On Duty"
  | "Offline";

export interface Responder {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ResponderStatus;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  createdAt: string;
}