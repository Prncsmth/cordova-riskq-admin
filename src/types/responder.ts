export type ResponderUnit = "BDRRMO" | "MDRRMO";

export interface Responder {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isOnDuty: boolean;
  unit: ResponderUnit | null;
  createdAt: string;
}
