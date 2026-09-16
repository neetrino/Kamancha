import { describe, expect, it } from "vitest";

import { isListedOnGroupOrderReceipt } from "@/features/orders/domain/group-order-receipt-participant";

describe("isListedOnGroupOrderReceipt", () => {
  it("always lists the active organizer, even with an empty bag", () => {
    expect(
      isListedOnGroupOrderReceipt({
        status: "ACTIVE",
        role: "ORGANIZER",
        subtotalAmount: 0,
      }),
    ).toBe(true);
  });

  it("lists a guest who ordered", () => {
    expect(
      isListedOnGroupOrderReceipt({
        status: "ACTIVE",
        role: "PARTICIPANT",
        subtotalAmount: 3400,
      }),
    ).toBe(true);
  });

  it("hides a guest who joined but never ordered", () => {
    expect(
      isListedOnGroupOrderReceipt({
        status: "ACTIVE",
        role: "PARTICIPANT",
        subtotalAmount: 0,
      }),
    ).toBe(false);
  });

  it("hides removed participants", () => {
    expect(
      isListedOnGroupOrderReceipt({
        status: "REMOVED",
        role: "ORGANIZER",
        subtotalAmount: 1000,
      }),
    ).toBe(false);
  });
});
