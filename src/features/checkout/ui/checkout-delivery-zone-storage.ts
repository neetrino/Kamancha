const CHECKOUT_DELIVERY_RULE_STORAGE_KEY = "kamancha.checkout.deliveryRuleId";

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

/** Stable subscribe for `useSyncExternalStore` (session storage has no events). */
export function subscribeCheckoutDeliveryRule(): () => void {
  return () => {};
}

/** Client snapshot of the stored delivery rule id. */
export function getCheckoutDeliveryRuleSnapshot(): string {
  return readCheckoutDeliveryRuleId() ?? "";
}

/** Server snapshot; storage is unavailable during SSR. */
export function getCheckoutDeliveryRuleServerSnapshot(): string {
  return "";
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
