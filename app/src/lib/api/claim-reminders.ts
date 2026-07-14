import { apiRequest } from "@/lib/api/client";

export type ClaimReminder = {
  id: number;
  quantity: number;
  remind_on: string | null;
  due: boolean;
  location: {
    id: number | null;
    name: string | null;
    type: string | null;
    barangay: string | null;
  };
  commodity: {
    id: number | null;
    name: string | null;
    unit: string | null;
  };
};

export async function listReminders(signal?: AbortSignal) {
  const res = await apiRequest<{ data: ClaimReminder[] }>("/claim-reminders", {
    signal,
  });
  return res.data;
}

export async function createReminder(body: {
  location_id: number;
  commodity_id: number;
  quantity: number;
  remind_on?: string;
}) {
  const res = await apiRequest<{ data: ClaimReminder }>("/claim-reminders", {
    method: "POST",
    body,
  });
  return res.data;
}

export function deleteReminder(id: number) {
  return apiRequest<{ message: string }>(`/claim-reminders/${id}`, {
    method: "DELETE",
  });
}
