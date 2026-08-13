import { describe, expect, it } from "vitest";

import { resolveCashChangeImageUrl } from "@/features/checkout/ui/checkout-cash-change-assets";

describe("resolveCashChangeImageUrl", () => {
  it("prefers an uploaded admin image", () => {
    expect(
      resolveCashChangeImageUrl(10_000, "https://cdn.example/note.webp"),
    ).toBe("https://cdn.example/note.webp");
  });

  it("falls back to the bundled banknote", () => {
    expect(resolveCashChangeImageUrl(2000, null)).toBe(
      "/assets/payments/amd/2000.webp",
    );
  });

  it("returns null when there is no bundled note", () => {
    expect(resolveCashChangeImageUrl(1000, null)).toBeNull();
  });

  it("treats an empty upload as missing", () => {
    expect(resolveCashChangeImageUrl(2000, "")).toBe(
      "/assets/payments/amd/2000.webp",
    );
  });
});
