import { HeartPulse, Flame, Car, ShieldAlert, CloudRain, FileQuestion } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EmergencyStatus, EmergencyType } from "@/types/emergency";

// Shared by EmergencyTable (list) and EmergencyDetails (detail page) so the
// two never drift into showing different colors/icons for the same type.
export const emergencyTypeStyles: Record<EmergencyType, { icon: LucideIcon; color: string }> = {
  Medical: { icon: HeartPulse, color: "text-success" },
  Fire: { icon: Flame, color: "text-danger" },
  Accident: { icon: Car, color: "text-warning" },
  Crime: { icon: ShieldAlert, color: "text-primary" },
  Disaster: { icon: CloudRain, color: "text-info" },
  Other: { icon: FileQuestion, color: "text-muted" },
};

export const defaultEmergencyTypeStyle = emergencyTypeStyles.Other;

export const emergencyStatusStyle: Record<EmergencyStatus, { variant: "danger" | "warning" | "success" | "default"; solid: boolean }> = {
  Active: { variant: "danger", solid: true },
  Responding: { variant: "warning", solid: false },
  Resolved: { variant: "success", solid: false },
  Cancelled: { variant: "default", solid: false },
};
