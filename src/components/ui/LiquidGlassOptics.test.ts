import { describe, expect, it } from "vitest";

import { canUseLiquidGlassRefraction } from "@/components/ui/LiquidGlassOptics";

function media(matches: boolean) {
  return { matchMedia: () => ({ matches }) };
}

describe("canUseLiquidGlassRefraction", () => {
  it("is off without a media source", () => {
    expect(canUseLiquidGlassRefraction(null)).toBe(false);
  });

  it("is on when the device is not coarse-touch", () => {
    expect(canUseLiquidGlassRefraction(media(false))).toBe(true);
  });

  it("is off for coarse touch devices", () => {
    expect(canUseLiquidGlassRefraction(media(true))).toBe(false);
  });
});
