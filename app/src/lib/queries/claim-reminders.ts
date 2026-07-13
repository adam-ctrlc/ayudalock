import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createReminder,
  deleteReminder,
  listReminders,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.claimReminders }),
  });
}
