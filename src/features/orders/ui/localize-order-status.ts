import { orderStatusLabel } from "@/features/orders/domain/order-status";
import { paymentStatusLabel } from "@/features/orders/domain/payment-status";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export type OrderStatusLabels = Dictionary["admin"]["orders"]["statusLabels"];

/** Maps a DB order status to the current locale label. */
export function localizeOrderStatus(
  status: string,
  labels: OrderStatusLabels,
): string {
  switch (orderStatusLabel(status)) {
    case "Pending":
      return labels.pending;
    case "Processing":
      return labels.processing;
    case "Completed":
      return labels.completed;
    case "Cancelled":
      return labels.cancelled;
    default:
      return status;
  }
}

/** Maps a DB payment status to the current locale label. */
export function localizePaymentStatus(
  status: string,
  labels: OrderStatusLabels,
): string {
  switch (paymentStatusLabel(status)) {
    case "Paid":
      return labels.paid;
    case "Pending":
      return labels.pending;
    case "Failed":
      return labels.failed;
    default:
      return status;
  }
}
