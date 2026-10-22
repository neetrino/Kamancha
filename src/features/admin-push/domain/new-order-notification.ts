import { formatOrderDrawerMoney } from "@/features/orders/ui/order-drawer-format";

/**
 * Shared tag for page and push notifications of one order, so the browser
 * collapses them into a single notification.
 */
export function adminNewOrderNotificationTag(orderNumber: string): string {
  return `admin-new-order-${orderNumber}`;
}

type NewOrderNotificationCopy = {
  pushTitle: string;
  pushBody: string;
};

type NewOrderNotificationOrder = {
  orderNumber: string;
  contactName: string;
  totalAmount: number;
  baseCurrency: string;
};

/** Localized title + body for a new-order OS / push notification. */
export function formatAdminNewOrderNotification(
  copy: NewOrderNotificationCopy,
  order: NewOrderNotificationOrder,
): { title: string; body: string } {
  return {
    title: copy.pushTitle.replace("{orderNumber}", order.orderNumber),
    body: copy.pushBody
      .replace("{customer}", order.contactName)
      .replace(
        "{total}",
        formatOrderDrawerMoney(order.totalAmount, order.baseCurrency),
      ),
  };
}
