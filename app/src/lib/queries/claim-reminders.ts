import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createReminder,
  deleteReminder,
  listReminders,
  type ClaimReminder,
} from "@/lib/api/claim-reminders";
import { qk } from "@/lib/queries/keys";

export function useClaimReminders() {
  return useQuery({
    queryKey: qk.claimReminders,
    queryFn: ({ signal }) => listReminders(signal),
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReminder,
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.claimReminders }),
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReminder(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: qk.claimReminders });
      const prev = qc.getQueryData<ClaimReminder[]>(qk.claimReminders);
      qc.setQueryData<ClaimReminder[]>(qk.claimReminders, (old) =>
        old?.filter((r) => r.id !== id),
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.claimReminders, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.claimReminders }),
  });
}
