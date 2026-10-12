// src/lib/announcementSeverity.ts
// How each announcement severity looks in the dashboard. The value itself
// comes from the backend's `priority` field (Information | Warning |
// Critical); this file only maps it to labels, colors and icons, so the
// form, preview and list all agree. Full Tailwind class strings (not
// built from parts) so the classes are kept in the production CSS.
import { Info, Siren, TriangleAlert, type LucideIcon } from "lucide-react";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { AnnouncementPriority } from "@/types/announcement";

export const ANNOUNCEMENT_SEVERITIES: AnnouncementPriority[] = ["Information", "Warning", "Critical"];

type SeverityStyle = {
  label: string;
  description: string;
  icon: LucideIcon;
  badge: BadgeVariant;
  // The selected button in the form.
  selected: string;
  // The preview's icon circle.
  iconCircle: string;
  // The megaphone/icon color in the list.
  text: string;
};

export const SEVERITY_STYLES: Record<AnnouncementPriority, SeverityStyle> = {
  Information: {
    label: "Information",
    description: "Routine notices and general community updates.",
    icon: Info,
    badge: "info",
    selected: "bg-info text-white shadow-xs",
    iconCircle: "bg-info",
    text: "text-info",
  },
  Warning: {
    label: "Warning",
    description: "A developing hazard people should prepare for, e.g. a flood or rainfall advisory.",
    icon: TriangleAlert,
    badge: "warning",
    selected: "bg-warning text-white shadow-xs",
    iconCircle: "bg-warning",
    text: "text-warning",
  },
  Critical: {
    label: "Critical Alert",
    description: "An immediate threat to life or safety, e.g. an evacuation order.",
    icon: Siren,
    badge: "danger",
    selected: "bg-danger text-white shadow-xs",
    iconCircle: "bg-danger",
    text: "text-danger",
  },
};

// A row from an older backend may still say Normal/Urgent -- Normal is
// Information and Urgent is Warning, the same mapping the backend uses.
export function toSeverity(value: string | null | undefined): AnnouncementPriority {
  if (value === "Warning" || value === "Critical" || value === "Information") return value;
  if (value === "Urgent") return "Warning";
  return "Information";
}
