import {
  Activity,
  BellRing,
  FileWarning,
  ShieldCheck,
  CheckCircle2,
  Building2,
  UserPlus,
  Headset,
  Megaphone,
  PencilLine,
  Trash2,
  MapPinned,
  UserCog,
  Phone,
  BellOff,
  LogIn,
  UserPen,
  KeyRound,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminActivity, AdminActivityType } from "@/hooks/useRecentActivity";

export const ACTIVITY_TYPE_STYLE: Record<
  AdminActivityType,
  { icon: LucideIcon; label: string; color: string }
> = {
  sos_alert: { icon: BellRing, label: "SOS Alert", color: "text-danger" },
  incident_reported: { icon: FileWarning, label: "Incident Report", color: "text-tide" },
  responder_joined: { icon: ShieldCheck, label: "Responder Joined", color: "text-info" },
  incident_resolved: { icon: CheckCircle2, label: "Incident Resolved", color: "text-success" },
  evacuation_center_updated: { icon: Building2, label: "Evacuation Center", color: "text-warning" },
  user_registered: { icon: UserPlus, label: "New User", color: "text-primary" },
  support_request: { icon: Headset, label: "Support Request", color: "text-info" },
  announcement_created: { icon: Megaphone, label: "Announcement Published", color: "text-primary" },
  announcement_updated: { icon: PencilLine, label: "Announcement Edited", color: "text-warning" },
  announcement_deleted: { icon: Trash2, label: "Announcement Deleted", color: "text-danger" },
  responder_barangay_updated: { icon: MapPinned, label: "Responder Assigned", color: "text-info" },
  user_role_updated: { icon: UserCog, label: "User Role Changed", color: "text-primary" },
  support_request_status_updated: { icon: Headset, label: "Support Request Updated", color: "text-success" },
  review_moderated: { icon: Star, label: "Review Moderated", color: "text-warning" },
  hotline_updated: { icon: Phone, label: "Hotline Updated", color: "text-warning" },
  sos_alert_closed: { icon: BellOff, label: "SOS Alert Closed", color: "text-success" },
  admin_login: { icon: LogIn, label: "Admin Sign-in", color: "text-muted" },
  admin_profile_updated: { icon: UserPen, label: "Admin Profile Updated", color: "text-primary" },
  admin_password_changed: { icon: KeyRound, label: "Admin Password Changed", color: "text-danger" },
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
  incident_reported: "/emergencies",
  responder_joined: "/responders",
  incident_resolved: "/incident-reports",
  evacuation_center_updated: "/evacuation-centers",
  user_registered: "/users",
  support_request: "/support-requests",
  announcement_created: "/announcements",
  announcement_updated: "/announcements",
  announcement_deleted: "/announcements",
  responder_barangay_updated: "/responders",
  user_role_updated: "/users",
  support_request_status_updated: "/support-requests",
  review_moderated: "/reviews",
  hotline_updated: "/hotlines",
  sos_alert_closed: "/sos-alerts",
  admin_login: "/audit-logs",
  admin_profile_updated: "/settings",
  admin_password_changed: "/settings",
};

// AdminActivity items have no id of their own (derived, not stored) -- this
// is the stable-enough key used for client-side read-state tracking.
export function getActivityKey(activity: AdminActivity): string {
  return `${activity.type}:${activity.occurredAt}:${activity.detail}`;
}
