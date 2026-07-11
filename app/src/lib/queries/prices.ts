import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPrice,
  getPriceHistory,
  listPrices,
  updatePrice,
  type PriceCategory,
} from "@/lib/api/prices";
import { qk } from "@/lib/queries/keys";

export function usePrices(category: PriceCategory | "all" = "all") {
  return useQuery({
    queryKey: [...qk.prices, category],
    queryFn: () => listPrices(category === "all" ? {} : { category }),
  });
}

export function usePriceHistory(id: number) {
  return useQuery({
    queryKey: [...qk.prices, id, "history"],
    queryFn: () => getPriceHistory(id),
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
