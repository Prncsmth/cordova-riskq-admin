export type UserRole = "citizen" | "responder" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  // Their profile photo, when they've set one (optional for citizens).
  avatarUrl?: string | null;
  role: UserRole;
  createdAt: string;
}
