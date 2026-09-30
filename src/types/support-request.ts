export type SupportRequestStatus = "open" | "in_progress" | "resolved";

export type SupportRequestTopic = "App issue" | "Report help" | "Account" | "Other";

export interface SupportRequest {
  id: string;
  topic: SupportRequestTopic;
  subject?: string | null;
  message: string;
  status: SupportRequestStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    mobile: string | null;
  };
}
