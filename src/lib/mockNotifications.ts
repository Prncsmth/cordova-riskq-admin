import { Siren, BellRing, ShieldAlert, Building2, Megaphone, UserPlus, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NotificationType = "sos" | "incident" | "responder" | "evacuation" | "announcement" | "user";

export type Notification = {
  id: string;
  type: NotificationType;
  icon: LucideIcon;
  color: string;
  bg: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  href: string;
};

export const notificationTypeLabels: Record<NotificationType, string> = {
  sos: "SOS Alerts",
  incident: "Incidents",
  responder: "Responders",
  evacuation: "Evacuation Centers",
  announcement: "Announcements",
  user: "Users",
};

// Mock data for UI — replace with real API/socket data once backend endpoints
// are available. Shared between the header's NotificationsMenu (latest few)
// and the full /notifications page (everything).
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "sos", icon: BellRing, color: "text-danger", bg: "bg-danger-light", title: "New SOS alert", detail: "Ana Reyes — Poblacion, Cordova", time: "2 min ago", read: false, href: "/sos-alerts" },
  { id: "n2", type: "incident", icon: Siren, color: "text-danger", bg: "bg-danger-light", title: "Fire incident reported", detail: "EMG-001 — Poblacion, Cordova", time: "10 min ago", read: false, href: "/emergencies" },
  { id: "n3", type: "responder", icon: ShieldAlert, color: "text-warning", bg: "bg-warning-light", title: "Responder awaiting verification", detail: "Mark Villanueva submitted documents", time: "1 hr ago", read: false, href: "/responders" },
  { id: "n4", type: "evacuation", icon: Building2, color: "text-info", bg: "bg-info-light", title: "Evacuation center near capacity", detail: "Gabi Evacuation Center — 60% full", time: "2 hr ago", read: true, href: "/evacuation-centers" },
  { id: "n5", type: "announcement", icon: Megaphone, color: "text-primary", bg: "bg-primary-light", title: "Announcement published", detail: "Storm Signal No. 1 Raised", time: "3 hr ago", read: true, href: "/announcements" },
  { id: "n6", type: "user", icon: UserPlus, color: "text-success", bg: "bg-success-light", title: "New user registered", detail: "Liza Fernandez joined Cordova RISKQ", time: "5 hr ago", read: true, href: "/users" },
  { id: "n7", type: "incident", icon: CheckCircle2, color: "text-success", bg: "bg-success-light", title: "Incident resolved", detail: "EMG-003 — Catarman, Cordova", time: "6 hr ago", read: true, href: "/emergencies" },
  { id: "n8", type: "sos", icon: BellRing, color: "text-warning", bg: "bg-warning-light", title: "SOS alert acknowledged", detail: "Mark Villanueva — Day-as, Cordova", time: "18 min ago", read: false, href: "/sos-alerts" },
  { id: "n9", type: "responder", icon: ShieldAlert, color: "text-success", bg: "bg-success-light", title: "Responder verified", detail: "Ana Reyes is now active", time: "1 day ago", read: true, href: "/responders" },
  { id: "n10", type: "evacuation", icon: Building2, color: "text-danger", bg: "bg-danger-light", title: "Evacuation center full", detail: "San Miguel Evacuation Center — at capacity", time: "1 day ago", read: true, href: "/evacuation-centers" },
];
