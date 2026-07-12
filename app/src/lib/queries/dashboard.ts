import { useQuery } from "@tanstack/react-query";

import { getHeatmap, getStats } from "@/lib/api/dashboard";
import { qk } from "@/lib/queries/keys";

export function useDashboardStats() {
  return useQuery({
    queryKey: qk.stats,
    queryFn: ({ signal }) => getStats(signal),
  });
}

export function useHeatmap() {
  return useQuery({
    queryKey: qk.heatmap,
    queryFn: ({ signal }) => getHeatmap(signal),
  });
}
