export const CHECKOUT_INVALID_FIELDS = [
  "firstName",
  "lastName",
  "contactEmail",
  "contactPhone",
  "line1",
  "deliverySlot",
  "paymentMethod",
] as const;

export type CheckoutInvalidField = (typeof CHECKOUT_INVALID_FIELDS)[number];

export type CheckoutInvalidFields = Partial<
  Record<CheckoutInvalidField, true>
>;

type CheckoutFieldValues = {
  firstName: string;
  lastName: string;
  contactEmail: string;
  contactPhone: string;
  line1: string;
  line1QuoteOk: boolean;
  hasDeliverySlot: boolean;
  hasPaymentMethod: boolean;
};

function isEmailValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Collects empty / invalid required checkout fields in display order. */
export function collectCheckoutInvalidFields(
  values: CheckoutFieldValues,
): CheckoutInvalidFields {
  const invalid: CheckoutInvalidFields = {};

  if (!values.firstName.trim()) invalid.firstName = true;
  if (!values.lastName.trim()) invalid.lastName = true;
  if (!isEmailValid(values.contactEmail.trim())) invalid.contactEmail = true;
  if (values.contactPhone.trim().length < 5) invalid.contactPhone = true;
  if (values.line1.trim().length < 3 || !values.line1QuoteOk) {
    invalid.line1 = true;
  }
  if (!values.hasDeliverySlot) invalid.deliverySlot = true;
  if (!values.hasPaymentMethod) invalid.paymentMethod = true;

  return invalid;
}

export function firstCheckoutInvalidField(
  invalid: CheckoutInvalidFields,
): CheckoutInvalidField | null {
  for (const field of CHECKOUT_INVALID_FIELDS) {
    if (invalid[field]) return field;
  }
  return null;
}

export function checkoutFieldSelector(field: CheckoutInvalidField): string {
  return `[data-checkout-field="${field}"]`;
}

/** Scrolls the first invalid control into view (works inside the sheet scroller). */
export function scrollToCheckoutField(field: CheckoutInvalidField): void {
  const target = document.querySelector(checkoutFieldSelector(field));
  if (!(target instanceof HTMLElement)) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });

  if (target instanceof HTMLInputElement) {
    target.focus({ preventScroll: true });
    return;
  }

  const focusable = target.querySelector(
    "input, button, [tabindex]:not([tabindex='-1'])",
  );
  if (focusable instanceof HTMLElement) {
    focusable.focus({ preventScroll: true });
  }
}
