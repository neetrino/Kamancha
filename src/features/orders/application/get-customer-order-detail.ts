"use server";

import {
  findCustomerGroupOrderShare,
  loadCustomerGroupOrderShareItems,
} from "@/features/orders/application/customer-group-order-share";
import {
  toAdminOrderDetailView,
  type AdminOrderDetailView,
} from "@/features/orders/application/order-detail-view";
import { getAdminOrderByNumber } from "@/features/orders/application/queries";
import { getStoreIdentity } from "@/features/settings/application/queries";
import { requireUser } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

/**
 * Customer-owned fetch of a single order for the profile order details drawer.
 * Returns NOT_FOUND when the order is missing or the user cannot access it.
 * Group-order participants see only their own share and bag lines.
 */
export async function getCustomerOrderDetailAction(
  locale: string,
  orderNumber: string,
): Promise<Result<AdminOrderDetailView>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const trimmed = orderNumber.trim();
  if (!trimmed || trimmed.length > 64) {
    return err("VALIDATION_ERROR", "Invalid order number.");
  }

  const user = await requireUser(locale as Locale);
  const loaded = await getAdminOrderByNumber(trimmed);

  if (!loaded) {
    return err("NOT_FOUND", "Order not found.");
  }

  const share = await findCustomerGroupOrderShare(
    user.id,
    loaded.order.groupOrderId,
  );
  const ownsOrder = loaded.order.userId === user.id;
  const canAccess =
    ownsOrder || (share != null && share.subtotalAmount > 0);

  if (!canAccess) {
    return err("NOT_FOUND", "Order not found.");
  }

  const identity = await getStoreIdentity();
  const view = toAdminOrderDetailView(loaded, identity.name);

  if (!share) {
    return ok(view);
  }

  const items = await loadCustomerGroupOrderShareItems({
    participantId: share.participantId,
    locale: locale as Locale,
    currency: loaded.order.baseCurrency,
  });

  return ok({
    ...view,
    subtotalAmount: share.subtotalAmount,
    deliveryAmount: share.deliveryShareAmount,
    discountAmount: 0,
    couponCode: null,
    totalAmount: share.finalAmount,
    paymentAmount: share.finalAmount,
    items,
  });
}
