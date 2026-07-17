import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createLocation,
  deleteLocation,
  restockLocation,
  updateLocation,
  type LocationInput,
} from "@/lib/api/locations";
import { listPrograms, updateProgram } from "@/lib/api/programs";
import { qk } from "@/lib/queries/keys";

export function usePrograms() {
  return useQuery({
    queryKey: qk.programs,
    queryFn: ({ signal }) => listPrograms(signal),
  });
}

function useReliefInvalidation() {
  const qc = useQueryClient();

  return () => {
    qc.invalidateQueries({ queryKey: qk.locations });
    qc.invalidateQueries({ queryKey: qk.programs });
    qc.invalidateQueries({ queryKey: qk.stats });
  };
}

export function useCreateLocation() {
  const invalidate = useReliefInvalidation();
  return useMutation({
    mutationFn: (body: LocationInput) => createLocation(body),
    onSuccess: invalidate,
  });
}

export function useUpdateLocation() {
  const invalidate = useReliefInvalidation();
  return useMutation({
    mutationFn: (args: { id: number; body: Partial<LocationInput> }) =>
      updateLocation(args.id, args.body),
    onSuccess: invalidate,
  });
}

export function useDeleteLocation() {
  const invalidate = useReliefInvalidation();
  return useMutation({
    mutationFn: (id: number) => deleteLocation(id),
    onSuccess: invalidate,
  });
}

export function useRestock() {
  const invalidate = useReliefInvalidation();
  return useMutation({
    mutationFn: (args: {
      id: number;
      commodity_id: number;
      quantity_available: number;
    }) =>
      restockLocation(args.id, {
        commodity_id: args.commodity_id,
        quantity_available: args.quantity_available,
      }),
    onSuccess: invalidate,
  });
}

export function useUpdateProgram() {
  const invalidate = useReliefInvalidation();
  return useMutation({
    mutationFn: (args: { id: number; per_beneficiary_cap: number }) =>
      updateProgram(args.id, { per_beneficiary_cap: args.per_beneficiary_cap }),
    onSuccess: invalidate,
  });
}
