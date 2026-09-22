import { Activity, BellRing, ShieldCheck, CheckCircle2, Building2, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminActivity, AdminActivityType } from "@/hooks/useRecentActivity";

export const ACTIVITY_TYPE_STYLE: Record<
  AdminActivityType,
  { icon: LucideIcon; label: string; color: string }
> = {
  sos_alert: { icon: BellRing, label: "SOS Alert", color: "text-danger" },
  responder_joined: { icon: ShieldCheck, label: "Responder Joined", color: "text-info" },
  incident_resolved: { icon: CheckCircle2, label: "Incident Resolved", color: "text-success" },
  evacuation_center_updated: { icon: Building2, label: "Evacuation Center", color: "text-warning" },
  user_registered: { icon: UserPlus, label: "New User", color: "text-primary" },
};

const DEFAULT_ACTIVITY_STYLE = { icon: Activity, label: "Activity", color: "text-muted" };

// activity.type comes from a live socket payload / REST response that's
// only compile-time cast to AdminActivityType, never runtime-validated -- a
// new activity kind added backend-first, a typo, or version skew between
// the two independently-deployed repos could send a value outside this
// lookup's keys. Falls back instead of letting a direct index throw
// undefined and crash the feed for every connected admin.
export function getActivityStyle(type: string) {
  return ACTIVITY_TYPE_STYLE[type as AdminActivityType] ?? DEFAULT_ACTIVITY_STYLE;
}

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
