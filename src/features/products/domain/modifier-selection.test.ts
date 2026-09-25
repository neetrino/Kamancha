import { describe, expect, it } from "vitest";

import {
  buildLineSelectionKey,
  buildModifierSelectionKey,
  sumAdditionPrices,
} from "@/features/products/domain/modifier-selection";

describe("modifier selection", () => {
  it("builds a stable sorted selection key", () => {
    expect(buildModifierSelectionKey(["b", "a", "b"])).toBe("a,b");
    expect(buildModifierSelectionKey([])).toBe("");
  });

  it("keeps a chosen attribute on its own line", () => {
    expect(buildLineSelectionKey(["b", "a"], null)).toBe("a,b");
    expect(buildLineSelectionKey([], "attr-1")).toBe("#attr-1");
    expect(buildLineSelectionKey(["b", "a"], "attr-1")).toBe("a,b#attr-1");
  });

  it("sums only addition prices", () => {
    expect(
      sumAdditionPrices([
        { kind: "ADDITION", priceAmount: 200 },
        { kind: "EXCEPTION", priceAmount: 0 },
        { kind: "ADDITION", priceAmount: 50 },
      ]),
    ).toBe(250);
  });
});
