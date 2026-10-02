/**
 * Payment methods recorded on gift cards.
 * Uses the same checkout method ids so cash vs card match checkout UX.
 */

/** Methods offered for gift-card purchase and admin issue. */
export const GIFT_CARD_PAYMENT_METHODS = [
  "cash_on_delivery",
  "arca",
] as const;

export type GiftCardPaymentMethod =
  (typeof GIFT_CARD_PAYMENT_METHODS)[number];

/** @deprecated Prefer GiftCardPaymentMethod — same set for admin and purchase. */
export type GiftCardAdminPaymentMethod = GiftCardPaymentMethod;
/** @deprecated Prefer GiftCardPaymentMethod. */
export type GiftCardPurchasePaymentMethod = GiftCardPaymentMethod;

export const GIFT_CARD_ADMIN_PAYMENT_METHODS = GIFT_CARD_PAYMENT_METHODS;
export const GIFT_CARD_PURCHASE_PAYMENT_METHODS = GIFT_CARD_PAYMENT_METHODS;

export type GiftCardPaymentDisplayKey = "cash" | "card" | "unknown";

/** Maps stored payment_method values to a display bucket. */
export function giftCardPaymentDisplayKey(
  paymentMethod: string | null | undefined,
): GiftCardPaymentDisplayKey {
  if (!paymentMethod) {
    return "unknown";
  }
  const normalized = paymentMethod.trim().toLowerCase();
  if (
    normalized === "cash" ||
    normalized === "cash_on_delivery" ||
    normalized === "cod"
  ) {
    return "cash";
  }
  if (
    normalized === "card" ||
    normalized === "arca" ||
    normalized === "terminal" ||
    normalized === "idram"
  ) {
    return "card";
  }
  return "unknown";
}

/**
 * Cash purchases activate immediately (no online capture).
 * Card/online methods stay PENDING_PAYMENT until capture or admin activate.
 */
export function shouldActivateGiftCardOnPurchase(
  paymentMethod: string,
): boolean {
  return giftCardPaymentDisplayKey(paymentMethod) === "cash";
}

export function isGiftCardPaymentMethod(
  value: string,
): value is GiftCardPaymentMethod {
  return (GIFT_CARD_PAYMENT_METHODS as readonly string[]).includes(value);
}

/** @deprecated Prefer isGiftCardPaymentMethod. */
export const isGiftCardAdminPaymentMethod = isGiftCardPaymentMethod;
