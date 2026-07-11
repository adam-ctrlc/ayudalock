import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelAllocation,
  createAllocation,
  listAllocations,
} from "@/lib/api/allocations";
import { qk } from "@/lib/queries/keys";

export function useAllocations() {
  return useQuery({ queryKey: qk.allocations, queryFn: listAllocations });
}

export function useCreateAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAllocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.allocations });
      qc.invalidateQueries({ queryKey: qk.locations });
    },
  });
}

export function useReleaseAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelAllocation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.allocations });
      qc.invalidateQueries({ queryKey: qk.locations });
    },
  });
}
