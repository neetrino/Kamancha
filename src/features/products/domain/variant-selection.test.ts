import { describe, expect, it } from "vitest";

import {
  buildVariantSignature,
  cartesianValueIds,
  defaultVariant,
  pickVariantForValue,
  variantMatchesSelection,
} from "@/features/products/domain/variant-selection";

describe("variant selection", () => {
  it("builds a stable signature regardless of input order", () => {
    expect(buildVariantSignature(["b", "a"])).toBe(
      buildVariantSignature(["a", "b"]),
    );
  });

  it("prefers an in-stock variant", () => {
    const chosen = defaultVariant([
      { id: "out", stockOnHand: 0 },
      { id: "in", stockOnHand: 2 },
    ]);
    expect(chosen?.id).toBe("in");
  });

  it("keeps the other axis when switching one value", () => {
    const variants = [
      {
        id: "lamb-small",
        stockOnHand: 1,
        options: [
          { attributeId: "meat", valueId: "lamb" },
          { attributeId: "size", valueId: "small" },
        ],
      },
      {
        id: "pork-small",
        stockOnHand: 1,
        options: [
          { attributeId: "meat", valueId: "pork" },
          { attributeId: "size", valueId: "small" },
        ],
      },
      {
        id: "lamb-large",
        stockOnHand: 4,
        options: [
          { attributeId: "meat", valueId: "lamb" },
          { attributeId: "size", valueId: "large" },
        ],
      },
    ];

    const next = pickVariantForValue(
      variants,
      { meat: "lamb", size: "small" },
      "size",
      "large",
    );
    expect(next?.id).toBe("lamb-large");
    expect(
      variantMatchesSelection(next?.options ?? [], {
        meat: "lamb",
        size: "large",
      }),
    ).toBe(true);
  });

  it("builds every combination of the selected values", () => {
    expect(cartesianValueIds([["lamb", "pork"], ["large"]])).toEqual([
      ["lamb", "large"],
      ["pork", "large"],
    ]);
  });
});
