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
    // Who sent it -- the mobile app's Contact Support form is shared by
    // citizens and responders. Optional for an older backend.
    role?: string;
  };
}

// "citizen" | "responder" (User.role) -> the label shown on a request.
export const REQUESTER_ROLE_LABEL: Record<string, string> = {
  citizen: "Citizen",
  responder: "Responder",
  admin: "Admin",
};
