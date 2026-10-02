import { describe, expect, it } from "vitest";

import { paymentMethodLabel } from "@/features/orders/domain/payment-method-label";

describe("paymentMethodLabel", () => {
  it("maps cash / COD codes to Cash", () => {
    expect(paymentMethodLabel("COD")).toBe("Cash");
    expect(paymentMethodLabel("cash")).toBe("Cash");
    expect(paymentMethodLabel("cash_on_delivery")).toBe("Cash");
  });

  it("maps card providers to Idram, ArCa, or Card", () => {
    expect(paymentMethodLabel("IDRAM")).toBe("Idram");
    expect(paymentMethodLabel("arca")).toBe("ArCa");
    expect(paymentMethodLabel("card")).toBe("Card");
  });

  it("maps terminal and leaves unknown codes unchanged", () => {
    expect(paymentMethodLabel("TERMINAL")).toBe("Terminal");
    expect(paymentMethodLabel("OTHER")).toBe("OTHER");
  });
});
