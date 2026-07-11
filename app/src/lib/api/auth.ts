import { apiRequest } from "@/lib/api/client";

export type UserRole = "citizen" | "merchant" | "lgu_admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phil_sys_id: string | null;
  phone: string | null;
  barangay_id: number | null;
  location_id: number | null;
};

export type AuthResponse = {
  token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
  user: User;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  phil_sys_id?: string;
  phone?: string;
  barangay_id?: number;
  location_id?: number;
};

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export async function me() {
  const res = await apiRequest<{ data: User }>("/auth/me");
  return res.data;
}

export function logout() {
  return apiRequest<{ message: string }>("/auth/logout", { method: "POST" });
}
