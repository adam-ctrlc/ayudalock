import { apiRequest } from "@/lib/api/client";

export type HeatmapEntry = {
  barangay_id: number;
  name: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  available: number;
  locked: number;
  redeemed: number;
  depletion_rate: number;
};

export type RedemptionByLocation = {
  location_id: number;
  location_name: string;
  redemptions: number;
  quantity: number;
};

export type SubsidyByProgram = {
  program_id: number;
  program_name: string;
  unit: string;
  quantity: number;
};

export type BlockedReason =
  | "not_eligible"
  | "over_cap"
  | "program_inactive"
  | "location_offline"
  | "insufficient_stock";

export type BlockedByReason = {
  reason: BlockedReason;
  label: string;
  count: number;
  is_leakage_prevented: boolean;
};

export type BlockedClaims = {
  total: number;
  leakage_prevented: number;
  by_reason: BlockedByReason[];
};

export type DashboardStats = {
  active_locks: { count: number; quantity: number };
  redemptions: { count: number; quantity: number };
  redemptions_by_location: RedemptionByLocation[];
  subsidies_by_program: SubsidyByProgram[];
  blocked_claims: BlockedClaims;
};

export async function getHeatmap(signal?: AbortSignal) {
  const res = await apiRequest<{ data: HeatmapEntry[] }>("/dashboard/heatmap", {
    signal,
  });
  return res.data;
}

export function getStats(signal?: AbortSignal) {
  return apiRequest<DashboardStats>("/dashboard/stats", { signal });
}
