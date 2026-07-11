import { useMutation } from "@tanstack/react-query";

import {
  batchRedeem,
  redeem,
  type BatchItem,
} from "@/lib/api/redemptions";

export function useRedeem() {
  return useMutation({
    mutationFn: (body: {
      token?: string;
      sms_code?: string;
      client_uuid?: string;
    }) => redeem(body),
  });
}

export function useOfflineSync() {
  return useMutation({
    mutationFn: (items: BatchItem[]) => batchRedeem(items),
  });
}
