import { BellRing, ShieldCheck, CheckCircle2, Building2, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminActivity, AdminActivityType } from "@/hooks/useRecentActivity";

export const ACTIVITY_TYPE_STYLE: Record<
  AdminActivityType,
  { icon: LucideIcon; label: string; color: string; bg: string }
> = {
  sos_alert: { icon: BellRing, label: "SOS Alert", color: "text-danger", bg: "bg-danger-light" },
  responder_joined: { icon: ShieldCheck, label: "Responder Joined", color: "text-info", bg: "bg-info-light" },
  incident_resolved: { icon: CheckCircle2, label: "Incident Resolved", color: "text-success", bg: "bg-success-light" },
  evacuation_center_updated: { icon: Building2, label: "Evacuation Center", color: "text-warning", bg: "bg-warning-light" },
  user_registered: { icon: UserPlus, label: "New User", color: "text-primary", bg: "bg-primary-light" },
};

// Where "View" on a notification/audit row should send the admin -- the feed
// has no per-item entity id to deep-link to, only a type, so this points at
// the relevant list page rather than a specific (unknown) record.
export const ACTIVITY_TYPE_HREF: Record<AdminActivityType, string> = {
  sos_alert: "/sos-alerts",
  responder_joined: "/responders",
  incident_resolved: "/incident-reports",
  evacuation_center_updated: "/evacuation-centers",
  user_registered: "/users",
};

// AdminActivity items have no id of their own (derived, not stored) -- this
// is the stable-enough key used for client-side read-state tracking.
export function getActivityKey(activity: AdminActivity): string {
  return `${activity.type}:${activity.occurredAt}:${activity.detail}`;
}
