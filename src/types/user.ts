export type UserStatus = "Active" | "Suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
}
