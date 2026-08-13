import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";

export type OrderPaymentSplit = {
  onlineAmount: number;
  cashAmount: number;
};

/**
 * Planned cash vs online portions of `totalAmount`.
 * Must satisfy `onlineAmount + cashAmount === totalAmount` (DB check).
 * Amounts already paid by other group-order participants count as online.
 */
export function plannedOrderPaymentSplit(input: {
  totalAmount: number;
  chargeAmount: number;
  paymentMethod: CheckoutPaymentMethod;
}): OrderPaymentSplit {
  const cashAmount =
    input.paymentMethod === "cash_on_delivery" ? input.chargeAmount : 0;
  return {
    onlineAmount: input.totalAmount - cashAmount,
    cashAmount,
  };
}
