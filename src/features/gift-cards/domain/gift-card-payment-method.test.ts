import { describe, expect, it } from "vitest";

import {
  giftCardPaymentDisplayKey,
  isGiftCardPaymentMethod,
  shouldActivateGiftCardOnPurchase,
} from "@/features/gift-cards/domain/gift-card-payment-method";

describe("gift-card-payment-method", () => {
  it("maps cash-like methods to cash", () => {
    expect(giftCardPaymentDisplayKey("cash")).toBe("cash");
    expect(giftCardPaymentDisplayKey("cash_on_delivery")).toBe("cash");
    expect(giftCardPaymentDisplayKey("COD")).toBe("cash");
  });

  it("maps card-like methods to card", () => {
    expect(giftCardPaymentDisplayKey("card")).toBe("card");
    expect(giftCardPaymentDisplayKey("arca")).toBe("card");
    expect(giftCardPaymentDisplayKey("terminal")).toBe("card");
    expect(giftCardPaymentDisplayKey("idram")).toBe("card");
  });

  it("treats missing/unknown methods as unknown", () => {
    expect(giftCardPaymentDisplayKey(null)).toBe("unknown");
    expect(giftCardPaymentDisplayKey("ADMIN_ISSUE")).toBe("unknown");
  });

  it("activates on purchase only for cash methods", () => {
    expect(shouldActivateGiftCardOnPurchase("cash_on_delivery")).toBe(true);
    expect(shouldActivateGiftCardOnPurchase("cash")).toBe(true);
    expect(shouldActivateGiftCardOnPurchase("arca")).toBe(false);
    expect(shouldActivateGiftCardOnPurchase("card")).toBe(false);
  });

  it("validates gift card payment methods", () => {
    expect(isGiftCardPaymentMethod("cash_on_delivery")).toBe(true);
    expect(isGiftCardPaymentMethod("arca")).toBe(true);
    expect(isGiftCardPaymentMethod("cash")).toBe(false);
    expect(isGiftCardPaymentMethod("card")).toBe(false);
  });
});
