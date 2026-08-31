import { describe, expect, it } from "vitest";

import { settlementStatusAfterCheckout } from "@/features/group-orders/domain/settlement";

describe("settlementStatusAfterCheckout", () => {
  it("returns PAID when nobody owes money", () => {
    expect(
      settlementStatusAfterCheckout([
        {
          status: "ACTIVE",
          finalAmount: 1000,
          paymentStatus: "NOT_REQUIRED",
        },
      ]),
    ).toBe("PAID");
  });

  it("returns PAID when every owing participant is settled", () => {
    expect(
      settlementStatusAfterCheckout([
        {
          status: "ACTIVE",
          finalAmount: 2000,
          paymentStatus: "PAID",
        },
        {
          status: "ACTIVE",
          finalAmount: 1500,
          paymentStatus: "MARKED_RECEIVED",
        },
      ]),
    ).toBe("PAID");
  });

  it("returns PARTIALLY_PAID when some owing participants are unpaid", () => {
    expect(
      settlementStatusAfterCheckout([
        {
          status: "ACTIVE",
          finalAmount: 2000,
          paymentStatus: "PAID",
        },
        {
          status: "ACTIVE",
          finalAmount: 1500,
          paymentStatus: "PENDING",
        },
      ]),
    ).toBe("PARTIALLY_PAID");
  });
});
