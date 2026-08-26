export type UserStatus = "Active" | "Suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: UserStatus;
  createdAt: string;
}
