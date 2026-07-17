import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPrice,
  deletePrice,
  getPriceHistory,
  listPrices,
  listRegions,
  updatePrice,
  type PriceCategory,
} from "@/lib/api/prices";
import { qk } from "@/lib/queries/keys";

export function usePrices(
  category: PriceCategory | "all" = "all",
  region?: string,
) {
  return useQuery({
    queryKey: [...qk.prices, category, region ?? "all"],
    queryFn: ({ signal }) =>
      listPrices(
        {
          ...(category === "all" ? {} : { category }),
          ...(region ? { region } : {}),
        },
        signal,
      ),
  });
}

export function usePriceRegions() {
  return useQuery({
    queryKey: [...qk.prices, "regions"],
    queryFn: ({ signal }) => listRegions(signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePriceHistory(id: number) {
  return useQuery({
    queryKey: [...qk.prices, id, "history"],
    queryFn: ({ signal }) => getPriceHistory(id, signal),
  });
}

export function useCreatePrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPrice,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.prices }),
  });
}

export function useUpdatePrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; value: number }) =>
      updatePrice(args.id, { value: args.value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.prices }),
  });
}

export function useDeletePrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePrice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.prices }),
  });
}
