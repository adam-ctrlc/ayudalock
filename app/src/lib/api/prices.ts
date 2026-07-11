import { apiRequest } from "@/lib/api/client";

export type PriceCategory = "fuel" | "fare" | "commodity";
export type PriceTrend = "up" | "down" | "steady";

export type PriceReference = {
  id: number;
  category: PriceCategory;
  name: string;
  value: number;
  unit: string;
  region: string;
  source: string | null;
  effective_date: string | null;
  previous_value: number | null;
  trend: PriceTrend;
  change: number | null;
  change_percent: number | null;
};

export type PriceHistory = {
  id: number;
  value: number;
  previous_value: number | null;
  effective_date: string | null;
  recorded_by: string | null;
  recorded_at: string | null;
};

export async function listPrices(filters: {
  category?: PriceCategory;
  region?: string;
} = {}) {
  const res = await apiRequest<{ data: PriceReference[] }>("/prices", {
    query: filters,
    auth: false,
  });
  return res.data;
}

export async function getPriceHistory(id: number) {
  const res = await apiRequest<{ data: PriceHistory[] }>(
    `/prices/${id}/history`,
    { auth: false },
  );
  return res.data;
}

export async function createPrice(body: {
  category: PriceCategory;
  name: string;
  value: number;
  unit: string;
  region?: string;
  source?: string;
}) {
  const res = await apiRequest<{ data: PriceReference }>("/prices", {
    method: "POST",
    body,
  });
  return res.data;
}

export async function updatePrice(
  id: number,
  body: { value: number; effective_date?: string; source?: string },
) {
  const res = await apiRequest<{ data: PriceReference }>(`/prices/${id}`, {
    method: "PUT",
    body,
  });
  return res.data;
}
