import { apiRequest } from "@/lib/api/client";

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  body: string;
  data: { announcement_id?: number } | null;
  read: boolean;
  created_at: string | null;
};

export async function listNotifications(signal?: AbortSignal) {
  const res = await apiRequest<{ data: AppNotification[] }>("/notifications", {
    signal,
  });
  return res.data;
}

export function markNotificationRead(id: number) {
  return apiRequest<{ message: string }>(`/notifications/${id}/read`, {
    method: "POST",
  });
}

export function markAllNotificationsRead() {
  return apiRequest<{ message: string }>("/notifications/read-all", {
    method: "POST",
  });
}
