import AsyncStorage from "@react-native-async-storage/async-storage";

import type { VoucherJwk } from "@/lib/api/keys";

const KEY = "ayudalock.voucher_jwk";

export async function readCachedJwk(): Promise<VoucherJwk | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as VoucherJwk;

    return typeof parsed.n === "string" && typeof parsed.e === "string"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export async function writeCachedJwk(jwk: VoucherJwk): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(jwk));
  } catch {
    return;
  }
}
