const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

const LOOKUP: Record<string, number> = {};

for (let i = 0; i < ALPHABET.length; i += 1) {
  LOOKUP[ALPHABET[i]] = i;
}

LOOKUP["-"] = 62;
LOOKUP["_"] = 63;

export function base64UrlToBytes(value: string): Uint8Array | null {
  const clean = value.replace(/=+$/, "");
  const out = new Uint8Array(Math.floor((clean.length * 6) / 8));

  let buffer = 0;
  let bits = 0;
  let index = 0;

  for (let i = 0; i < clean.length; i += 1) {
    const sextet = LOOKUP[clean[i]];

    if (sextet === undefined) {
      return null;
    }

    buffer = (buffer << 6) | sextet;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      out[index] = (buffer >> bits) & 0xff;
      index += 1;
    }
  }

  return out;
}

export function bytesToAsciiString(bytes: Uint8Array): string {
  let out = "";

  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i]);
  }

  return out;
}
