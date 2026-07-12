import { apiRequest } from "@/lib/api/client";
import type { Commodity, Program } from "@/lib/api/eligibility";
import type { Location } from "@/lib/api/locations";

export type AllocationStatus = "locked" | "redeemed" | "expired" | "cancelled";

export type Voucher = {
  token: string;
  qr_payload: string;
  sms_code: string;
  expires_at: string | null;
  redeemed_at: string | null;
};

export type Allocation = {
  id: number;
  status: AllocationStatus;
  quantity: number;
  expires_at: string | null;
  created_at?: string | null;
  commodity?: Commodity;
  program?: Program;
  location?: Location;
  voucher?: Voucher;
};

export async function listAllocations(signal?: AbortSignal) {
  const res = await apiRequest<{ data: Allocation[] }>("/allocations", {
    signal,
  });
  return res.data;
}

export async function createAllocation(body: {
  location_id: number;
  commodity_id: number;
  quantity: number;
}) {
  const res = await apiRequest<{ data: Allocation }>("/allocations", {
    method: "POST",
    body,
  });
  return res.data;
}

export function cancelAllocation(id: number) {
  return apiRequest<{ message: string }>(`/allocations/${id}`, {
    method: "DELETE",
  });
}
