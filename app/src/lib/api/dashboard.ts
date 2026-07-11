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

export type DashboardStats = {
  active_locks: { count: number; quantity: number };
  redemptions: { count: number; quantity: number };
  redemptions_by_location: RedemptionByLocation[];
  subsidies_by_program: SubsidyByProgram[];
};

export async function getHeatmap() {
  const res = await apiRequest<{ data: HeatmapEntry[] }>("/dashboard/heatmap");
  return res.data;
}

export function getStats() {
  return apiRequest<DashboardStats>("/dashboard/stats");
}
