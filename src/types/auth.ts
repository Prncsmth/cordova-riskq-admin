export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AdminUser;
  token: string;
}