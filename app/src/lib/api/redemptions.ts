import { apiRequest } from "@/lib/api/client";

export type RedemptionSource = "online" | "offline";

export type Redemption = {
  id: number;
  allocation_id: number;
  location_id: number;
  merchant_id: number;
  quantity: number;
  source: RedemptionSource;
  client_uuid: string | null;
  redeemed_at: string | null;
  synced_at: string | null;
};

export async function redeem(body: {
  token?: string;
  sms_code?: string;
  client_uuid?: string;
}) {
  const res = await apiRequest<{ data: Redemption }>("/redemptions", {
    method: "POST",
    body,
  });
  return res.data;
}

export type BatchItem = {
  client_uuid: string;
  token?: string;
  sms_code?: string;
  redeemed_at?: string;
};

export type BatchResult = {
  client_uuid: string;
  status: "accepted" | "duplicate" | "rejected";
  reason?: string;
  redemption_id?: number;
};

export async function batchRedeem(items: BatchItem[]) {
  const res = await apiRequest<{ results: BatchResult[] }>(
    "/redemptions/batch",
    { method: "POST", body: { items } },
  );
  return res.results;
}
