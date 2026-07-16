import { apiRequest } from "@/lib/api/client";

export type VoucherJwk = {
  kty: string;
  alg: string;
  use: string;
  n: string;
  e: string;
};

export type VoucherKeyResponse = {
  algorithm: string;
  public_key: string;
  jwk: VoucherJwk;
};

export async function getVoucherKey(signal?: AbortSignal) {
  return apiRequest<VoucherKeyResponse>("/keys/voucher-public", {
    auth: false,
    signal,
  });
}
