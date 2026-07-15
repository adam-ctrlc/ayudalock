import { useQuery } from "@tanstack/react-query";

import { getProvinceDetail, listProvinceImpacts } from "@/lib/api/heatmap";
import { qk } from "@/lib/queries/keys";

export function useProvinceImpacts(windowDays = 30) {
  return useQuery({
    queryKey: [...qk.impactMap, windowDays],
    queryFn: ({ signal }) => listProvinceImpacts(windowDays, signal),
  });
}

export function useProvinceDetail(code: string | null) {
  return useQuery({
    queryKey: [...qk.impactMap, "province", code],
    queryFn: ({ signal }) => getProvinceDetail(code as string, signal),
    enabled: code != null,
  });
}
