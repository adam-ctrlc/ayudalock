import { useQuery } from "@tanstack/react-query";

import { getVoucherKey, type VoucherJwk } from "@/lib/api/keys";
import { qk } from "@/lib/queries/keys";
import { readCachedJwk, writeCachedJwk } from "@/lib/voucher/key-store";

export async function resolveVoucherJwk(
  signal?: AbortSignal,
): Promise<VoucherJwk | null> {
  try {
    const res = await getVoucherKey(signal);
    await writeCachedJwk(res.jwk);
    return res.jwk;
  } catch {
    return readCachedJwk();
  }
}

export function useVoucherKey() {
  return useQuery({
    queryKey: qk.voucherKey,
    queryFn: ({ signal }) => resolveVoucherJwk(signal),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}
