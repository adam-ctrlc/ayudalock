import * as Crypto from "expo-crypto";

import { base64UrlToBytes, bytesToAsciiString } from "@/lib/voucher/base64url";
import {
  bigIntToBytes,
  bytesToBigInt,
  modPow,
  pkcs1Sha256DigestFrom,
} from "@/lib/voucher/rsa";
import type { VoucherJwk } from "@/lib/api/keys";

export type VoucherPayload = {
  aid: number;
  exp: number;
  sms: string;
};

export type VerifyResult =
  | { status: "verified"; payload: VoucherPayload }
  | { status: "expired"; payload: VoucherPayload }
  | { status: "invalid_signature" }
  | { status: "malformed" }
  | { status: "no_key" };

export function tokenFromQrPayload(raw: string): string | null {
  const trimmed = raw.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as { token?: unknown };
    return typeof parsed.token === "string" ? parsed.token : null;
  } catch {
    return trimmed;
  }
}

function decodePayload(bytes: Uint8Array): VoucherPayload | null {
  try {
    const parsed = JSON.parse(bytesToAsciiString(bytes)) as Record<string, unknown>;

    if (
      typeof parsed.aid !== "number" ||
      typeof parsed.exp !== "number" ||
      typeof parsed.sms !== "string"
    ) {
      return null;
    }

    return { aid: parsed.aid, exp: parsed.exp, sms: parsed.sms };
  } catch {
    return null;
  }
}

export async function verifyVoucherToken(
  token: string,
  jwk: VoucherJwk | null,
  now: Date = new Date(),
): Promise<VerifyResult> {
  if (jwk === null) {
    return { status: "no_key" };
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return { status: "malformed" };
  }

  const [encodedPayload, encodedSignature] = parts;

  const signatureBytes = base64UrlToBytes(encodedSignature);
  const payloadBytes = base64UrlToBytes(encodedPayload);
  const modulusBytes = base64UrlToBytes(jwk.n);
  const exponentBytes = base64UrlToBytes(jwk.e);

  if (!signatureBytes || !payloadBytes || !modulusBytes || !exponentBytes) {
    return { status: "malformed" };
  }

  const n = bytesToBigInt(modulusBytes);
  const e = bytesToBigInt(exponentBytes);
  const s = bytesToBigInt(signatureBytes);

  if (n === 0n || s >= n) {
    return { status: "invalid_signature" };
  }

  const encoded = bigIntToBytes(modPow(s, e, n), modulusBytes.length);
  const signedDigest = pkcs1Sha256DigestFrom(encoded);

  if (signedDigest === null) {
    return { status: "invalid_signature" };
  }

  const actualDigest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    encodedPayload,
    { encoding: Crypto.CryptoEncoding.HEX },
  );

  if (signedDigest !== actualDigest.toLowerCase()) {
    return { status: "invalid_signature" };
  }

  const payload = decodePayload(payloadBytes);

  if (payload === null) {
    return { status: "malformed" };
  }

  if (payload.exp * 1000 <= now.getTime()) {
    return { status: "expired", payload };
  }

  return { status: "verified", payload };
}
