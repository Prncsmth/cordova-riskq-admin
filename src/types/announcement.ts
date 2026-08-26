export type AnnouncementPriority = "Normal" | "Urgent";

export type AnnouncementAudience = "All Users" | "Responders Only" | "Specific Barangay";

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}