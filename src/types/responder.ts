export type ResponderUnit = "BDRRMO" | "MDRRMO";

export interface Responder {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  // Their profile photo, when they've set one.
  avatarUrl?: string | null;
  isOnDuty: boolean;
  unit: ResponderUnit | null;
  assignedBarangay: string | null;
  createdAt: string;
}
