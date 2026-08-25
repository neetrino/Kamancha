import { describe, expect, it, vi } from "vitest";

import { createClientId, createId } from "@/lib/id";

const UUID_V7_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("createId", () => {
  it("returns a UUIDv7 string", () => {
    expect(createId()).toMatch(UUID_V7_PATTERN);
  });

  it("returns unique values", () => {
    expect(createId()).not.toBe(createId());
  });
});

describe("createClientId", () => {
  it("returns a UUID string", () => {
    expect(createClientId()).toMatch(UUID_PATTERN);
  });

  it("works when crypto.randomUUID is missing", () => {
    const original = globalThis.crypto;
    vi.stubGlobal("crypto", {
      getRandomValues: original.getRandomValues.bind(original),
    });

    try {
      expect(createClientId()).toMatch(UUID_PATTERN);
    } finally {
      vi.stubGlobal("crypto", original);
    }
  });
});
