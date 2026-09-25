import { describe, expect, it } from "vitest";

import {
  formatPiecesCount,
  isQuickAddLine,
  MAX_QUICK_ADD_QUANTITY,
} from "@/features/cart/domain/plain-line";

describe("plain cart lines", () => {
  it("treats a bare product row as a quick-add line", () => {
    expect(
      isQuickAddLine({ modifiers: [], variant: null, attributeId: null }),
    ).toBe(true);
  });

  it("keeps configured dishes off the product-card stepper", () => {
    expect(
      isQuickAddLine({
        modifiers: [{ id: "add" }],
        variant: null,
        attributeId: null,
      }),
    ).toBe(false);
    expect(
      isQuickAddLine({
        modifiers: [],
        variant: { id: "var" },
        attributeId: null,
      }),
    ).toBe(false);
    expect(
      isQuickAddLine({
        modifiers: [],
        variant: null,
        attributeId: "attr",
      }),
    ).toBe(false);
  });

  it("formats the pieces label from the catalog template", () => {
    expect(formatPiecesCount("{count}pcs", 13)).toBe("13pcs");
    expect(formatPiecesCount("{count} հատ", 2)).toBe("2 հատ");
    expect(MAX_QUICK_ADD_QUANTITY).toBeGreaterThan(1);
  });
});
