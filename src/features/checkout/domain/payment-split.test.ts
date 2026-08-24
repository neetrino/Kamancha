import { describe, expect, it } from "vitest";

import { plannedOrderPaymentSplit } from "@/features/checkout/domain/payment-split";

describe("plannedOrderPaymentSplit", () => {
  it("puts the full total on cash for COD", () => {
    expect(
      plannedOrderPaymentSplit({
        totalAmount: 2099,
        chargeAmount: 2099,
        paymentMethod: "cash_on_delivery",
      }),
    ).toEqual({ onlineAmount: 0, cashAmount: 2099 });
  });

  it("puts the full total online for Idram", () => {
    expect(
      plannedOrderPaymentSplit({
        totalAmount: 2099,
        chargeAmount: 2099,
        paymentMethod: "idram",
      }),
    ).toEqual({ onlineAmount: 2099, cashAmount: 0 });
  });

  it("counts prepaid group-order amounts as online when organizer pays cash", () => {
    expect(
      plannedOrderPaymentSplit({
        totalAmount: 5000,
        chargeAmount: 2000,
        paymentMethod: "cash_on_delivery",
      }),
    ).toEqual({ onlineAmount: 3000, cashAmount: 2000 });
  });

  it("counts the full total as online when organizer pays by card", () => {
    expect(
      plannedOrderPaymentSplit({
        totalAmount: 5000,
        chargeAmount: 2000,
        paymentMethod: "arca",
      }),
    ).toEqual({ onlineAmount: 5000, cashAmount: 0 });
  });
});
