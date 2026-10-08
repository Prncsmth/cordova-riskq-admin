import { HeartPulse, Flame, Car, ShieldAlert, CloudRain, Siren, FileQuestion } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { EmergencyStatus, EmergencyType } from "@/types/emergency";

// Shared by EmergencyTable (list) and EmergencyDetails (detail page) so the
// two never drift into showing different colors/icons for the same type.
export const emergencyTypeStyles: Record<EmergencyType, { icon: LucideIcon; color: string }> = {
  Medical: { icon: HeartPulse, color: "text-success" },
  Fire: { icon: Flame, color: "text-danger" },
  Accident: { icon: Car, color: "text-warning" },
  Crime: { icon: ShieldAlert, color: "text-primary" },
  Disaster: { icon: CloudRain, color: "text-info" },
  // Was folded into "Other" (see incidentCategory.ts) -- gave every SOS-
  // triggered incident the same generic icon/label as an uncategorized one
  // in the Live Incidents table, with nothing marking it as SOS.
  SOS: { icon: Siren, color: "text-danger" },
  Other: { icon: FileQuestion, color: "text-muted" },
};

export const defaultEmergencyTypeStyle = emergencyTypeStyles.Other;

export const emergencyStatusStyle: Record<EmergencyStatus, { variant: BadgeVariant; solid: boolean }> = {
  Active: { variant: "danger", solid: true },
  Responding: { variant: "warning", solid: false },
  Resolved: { variant: "success", solid: false },
  Cancelled: { variant: "default", solid: false },
  // Matches the SOS Alerts page's Expired badge.
  Expired: { variant: "info", solid: false },
};

// Statuses that mean the incident is closed -- dropped from the live
// incidents list and the live map.
export const TERMINAL_EMERGENCY_STATUSES: EmergencyStatus[] = ["Resolved", "Cancelled", "Expired"];
