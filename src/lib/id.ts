import { v7 as uuidv7 } from "uuid";

/** Generate a sortable UUIDv7 for new entity primary keys. */
export function createId(): string {
  return uuidv7();
}

/**
 * Unique id for browser UI / idempotency keys.
 * Falls back when Web Crypto is missing (e.g. mobile Safari over LAN HTTP).
 */
export function createClientId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  try {
    return createId();
  } catch {
    // Insecure contexts may lack getRandomValues as well.
  }

  const bytes = new Uint8Array(16);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
