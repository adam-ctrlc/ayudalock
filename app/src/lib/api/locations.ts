import { apiRequest } from "@/lib/api/client";
import type { Commodity } from "@/lib/api/eligibility";
import type { PowerStatus } from "@/lib/api/energy";

export type LocationType = "kadiwa_store" | "gas_station";

export type Inventory = {
  commodity_id: number;
  commodity?: Commodity;
  quantity_available: number;
  quantity_locked: number;
};

export type Location = {
  id: number;
  name: string;
  type: LocationType;
  barangay_id: number;
  barangay?: string;
  latitude: string | null;
  longitude: string | null;
  is_active: boolean;
  has_generator: boolean;
  power_status: PowerStatus | null;
  power_status_updated_at: string | null;
  inventories?: Inventory[];
};

export type LocationFilters = {
  type?: LocationType;
  barangay_id?: number;
  commodity_id?: number;
};

export async function listLocations(
  filters: LocationFilters = {},
  signal?: AbortSignal,
) {
  const res = await apiRequest<{ data: Location[] }>("/locations", {
    query: filters,
    signal,
  });
  return res.data;
}

export async function getLocation(id: number, signal?: AbortSignal) {
  const res = await apiRequest<{ data: Location }>(`/locations/${id}`, {
    signal,
  });
  return res.data;
}
