const SHA256_DIGEST_INFO = "3031300d060960864801650304020105000420";

const MIN_PADDING_BYTES = 8;

export function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = 0n;

  for (let i = 0; i < bytes.length; i += 1) {
    result = (result << 8n) | BigInt(bytes[i]);
  }

  return result;
}

export function bigIntToBytes(value: bigint, length: number): Uint8Array {
  const out = new Uint8Array(length);
  let current = value;

  for (let i = length - 1; i >= 0; i -= 1) {
    out[i] = Number(current & 0xffn);
    current >>= 8n;
  }

  return out;
}

export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  let result = 1n;
  let b = base % modulus;
  let e = exponent;

  while (e > 0n) {
    if (e & 1n) {
      result = (result * b) % modulus;
    }

    b = (b * b) % modulus;
    e >>= 1n;
  }

  return result;
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = "";

  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0");
  }

  return out;
}

export function pkcs1Sha256DigestFrom(encoded: Uint8Array): string | null {
  if (encoded[0] !== 0x00 || encoded[1] !== 0x01) {
    return null;
  }

  let i = 2;

  while (i < encoded.length && encoded[i] === 0xff) {
    i += 1;
  }

  if (i - 2 < MIN_PADDING_BYTES || encoded[i] !== 0x00) {
    return null;
  }

  const tail = bytesToHex(encoded.slice(i + 1));

  if (!tail.startsWith(SHA256_DIGEST_INFO)) {
    return null;
  }

  return tail.slice(SHA256_DIGEST_INFO.length);
}
