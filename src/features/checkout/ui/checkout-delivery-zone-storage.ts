const CHECKOUT_DELIVERY_RULE_STORAGE_KEY = "kamancha.checkout.deliveryRuleId";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

/** Restores the selected checkout delivery zone across locale navigations. */
export function readCheckoutDeliveryRuleId(): string | null {
  if (!canUseSessionStorage()) return null;
  try {
    const value = sessionStorage.getItem(CHECKOUT_DELIVERY_RULE_STORAGE_KEY);
    return value?.trim() || null;
  } catch {
    return null;
  }
}

export function writeCheckoutDeliveryRuleId(deliveryRuleId: string): void {
  if (!canUseSessionStorage()) return;
  try {
    const trimmed = deliveryRuleId.trim();
    if (!trimmed) {
      sessionStorage.removeItem(CHECKOUT_DELIVERY_RULE_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(CHECKOUT_DELIVERY_RULE_STORAGE_KEY, trimmed);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function clearCheckoutDeliveryRuleId(): void {
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.removeItem(CHECKOUT_DELIVERY_RULE_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
