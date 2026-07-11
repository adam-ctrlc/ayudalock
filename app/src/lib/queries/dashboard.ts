import { useQuery } from "@tanstack/react-query";

import { getHeatmap, getStats } from "@/lib/api/dashboard";
import { qk } from "@/lib/queries/keys";

export function useDashboardStats() {
  return useQuery({ queryKey: qk.stats, queryFn: getStats });
}

export function useHeatmap() {
  return useQuery({ queryKey: qk.heatmap, queryFn: getHeatmap });
}
