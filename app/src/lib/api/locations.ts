import { apiRequest } from "@/lib/api/client";
import type { Commodity } from "@/lib/api/eligibility";

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
  inventories?: Inventory[];
};

export type LocationFilters = {
  type?: LocationType;
  barangay_id?: number;
  commodity_id?: number;
};

export async function listLocations(filters: LocationFilters = {}) {
  const res = await apiRequest<{ data: Location[] }>("/locations", {
    query: filters,
  });
  return res.data;
}

export async function getLocation(id: number) {
  const res = await apiRequest<{ data: Location }>(`/locations/${id}`);
  return res.data;
}
