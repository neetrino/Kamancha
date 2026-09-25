import { describe, expect, it } from "vitest";

import { splitOrderItemTitle } from "@/features/orders/domain/order-item-label";

describe("splitOrderItemTitle", () => {
  it("lifts a snapshot suffix into its own label", () => {
    expect(splitOrderItemTitle("Khorovats · Lamb", "Lamb")).toEqual({
      title: "Khorovats",
      optionLabel: "Lamb",
    });
  });

  it("keeps a label that is not already in the title", () => {
    expect(splitOrderItemTitle("Khorovats", "Lamb")).toEqual({
      title: "Khorovats",
      optionLabel: "Lamb",
    });
  });

  it("returns the title alone when no option was chosen", () => {
    expect(splitOrderItemTitle("Khorovats", null)).toEqual({
      title: "Khorovats",
      optionLabel: null,
    });
  });
});
