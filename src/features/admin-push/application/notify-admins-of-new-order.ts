import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { orders } from "@/db/schema";
import {
  deleteAdminPushSubscriptionsByIds,
  listActiveAdminPushSubscriptions,
} from "@/features/admin-push/application/admin-push-subscriptions-repository";
import {
  adminNewOrderNotificationTag,
  formatAdminNewOrderNotification,
} from "@/features/admin-push/domain/new-order-notification";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { logger } from "@/lib/observability/logger";
import {
  getWebPushPublicKey,
  sendWebPush,
  type WebPushPayload,
} from "@/lib/push/web-push-sender";

type OrderSummary = {
  orderNumber: string;
  contactName: string;
  totalAmount: number;
  baseCurrency: string;
};

async function loadOrderSummary(
  orderNumber: string,
): Promise<OrderSummary | null> {
  const [row] = await getDb()
    .select({
      orderNumber: orders.orderNumber,
      contactName: orders.contactName,
      totalAmount: orders.totalAmount,
      baseCurrency: orders.baseCurrency,
    })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);
  return row ?? null;
}

function buildPayload(order: OrderSummary, locale: Locale): WebPushPayload {
  return {
    ...formatAdminNewOrderNotification(
      getDictionary(locale).admin.orders.newAlert,
      order,
    ),
    url: `/${locale}/admin/orders?new=1`,
    tag: adminNewOrderNotificationTag(order.orderNumber),
  };
}

async function deliver(order: OrderSummary): Promise<void> {
  const subscriptions = await listActiveAdminPushSubscriptions();
  if (subscriptions.length === 0) return;

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      sendWebPush(
        subscription,
        buildPayload(
          order,
          isLocale(subscription.locale) ? subscription.locale : defaultLocale,
        ),
      ),
    ),
  );

  const expiredIds: string[] = [];
  results.forEach((result, index) => {
    const subscription = subscriptions[index];
    if (!subscription) return;
    if (result.status === "fulfilled") {
      if (result.value === "expired") expiredIds.push(subscription.id);
      return;
    }
    logger.warn("admin_push_send_failed", {
      subscriptionId: subscription.id,
      orderNumber: order.orderNumber,
      error:
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason),
    });
  });

  await deleteAdminPushSubscriptionsByIds(expiredIds);
}

/**
 * Web Push alert to every subscribed active admin. Never throws — call after
 * the order transaction commits, outside the checkout response path.
 */
export async function notifyAdminsOfNewOrder(
  orderNumber: string,
): Promise<void> {
  try {
    if (!getWebPushPublicKey()) return;
    const order = await loadOrderSummary(orderNumber);
    if (!order) {
      logger.warn("admin_push_order_not_found", { orderNumber });
      return;
    }
    await deliver(order);
  } catch (error) {
    logger.error("admin_push_notify_failed", {
      orderNumber,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
