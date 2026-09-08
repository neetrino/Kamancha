import "server-only";

import { formatDeliverySlotDisplay } from "@/features/delivery/domain/delivery-schedule";
import {
  loadAdminGroupOrderParticipantsView,
  type AdminGroupOrderParticipantView,
} from "@/features/orders/application/group-order-participants-view";
import { paymentMethodLabel } from "@/features/orders/domain/payment-method-label";
import { mediaPublicUrl } from "@/lib/media/public-url";
import { getStoreIdentity } from "@/features/settings/application/queries";
import {
  getAdminOrderByNumber,
  type AdminOrderDetail,
} from "@/features/orders/application/queries";
import type { Locale } from "@/lib/i18n/config";

export type AdminOrderDetailItemView = {
  id: string;
  title: string;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceAmount: number;
  lineTotalAmount: number;
  currency: string;
  modifiers: Array<{
    id: string;
    kind: "ADDITION" | "EXCEPTION";
    name: string;
    unitPriceAmount: number;
  }>;
};

export type AdminOrderDetailView = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  baseCurrency: string;
  subtotalAmount: number;
  deliveryAmount: number;
  discountAmount: number;
  bonusEarnedAmount: number;
  totalAmount: number;
  deliveryLabel: string | null;
  couponCode: string | null;
  isPickup: boolean;
  isGroupOrder: boolean;
  /** Present for group orders; null for regular orders. */
  groupPaymentMode: "ORGANIZER_PAYS_ALL" | "SPLIT_PER_PARTICIPANT" | null;
  storeName: string;
  shippingMethod: string;
  addressLine: string;
  addressHint: string | null;
  floor: string | null;
  intercomCode: string | null;
  scheduledDelivery: string | null;
  cashChangeAmount: number | null;
  paymentMethod: string;
  paymentAmount: number;
  items: AdminOrderDetailItemView[];
  groupParticipants: AdminGroupOrderParticipantView[];
};

/** Geocoder segments come as "Yerevan 0025"; postal codes are not displayed. */
function withoutPostalCode(segment: string): string {
  return segment.trim().replace(/(?:^|\s)\d{4,6}$/, "").trim();
}

/**
 * Displayed as "street, city". `line1` holds the geocoder's formatted address
 * for map-picked checkouts, so only its street segment is used; postal code,
 * region and country are not displayed.
 */
function formatAddressLine(
  address: AdminOrderDetail["order"]["shippingAddress"],
): string {
  const lineSegments = (address.line1 ?? "")
    .split(",")
    .map((segment) => withoutPostalCode(segment))
    .filter((segment) => segment.length > 0);

  const street = [lineSegments[0], address.line2?.trim()]
    .filter((part): part is string => Boolean(part))
    .join(", ");
  const city = withoutPostalCode(address.city ?? "") || lineSegments[1] || "";

  if (!city || street.toLowerCase().includes(city.toLowerCase())) {
    return street;
  }

  return street ? `${street}, ${city}` : city;
}

/** Maps a loaded order into a serializable admin drawer view. */
export function toAdminOrderDetailView(
  detail: AdminOrderDetail,
  storeName: string,
): AdminOrderDetailView {
  const { order, items, payments } = detail;
  const isPickup = order.deliveryLabelSnapshot === "Store pickup";
  const latestPayment = payments[0] ?? null;

  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    contactName: order.contactName,
    contactEmail: order.contactEmail,
    contactPhone: order.contactPhone,
    baseCurrency: order.baseCurrency,
    subtotalAmount: order.subtotalAmount,
    deliveryAmount: order.deliveryAmount,
    discountAmount: order.discountAmount,
    bonusEarnedAmount: order.bonusEarnedAmount,
    totalAmount: order.totalAmount,
    deliveryLabel: order.deliveryLabelSnapshot,
    couponCode: order.promotionCodeSnapshot,
    isPickup,
    isGroupOrder: order.groupOrderId != null,
    groupPaymentMode: null,
    storeName,
    shippingMethod: isPickup
      ? "pickup"
      : (order.deliveryLabelSnapshot ?? "delivery"),
    addressLine: formatAddressLine(order.shippingAddress),
    addressHint: isPickup
      ? "You can pick up your order at this store"
      : null,
    floor: order.shippingAddress.floor?.trim() || null,
    intercomCode: order.shippingAddress.intercomCode?.trim() || null,
    scheduledDelivery:
      order.shippingAddress.scheduledDeliveryDate &&
      order.shippingAddress.scheduledDeliveryStart &&
      order.shippingAddress.scheduledDeliveryEnd
        ? formatDeliverySlotDisplay(
            order.shippingAddress.scheduledDeliveryDate,
            order.shippingAddress.scheduledDeliveryStart,
            order.shippingAddress.scheduledDeliveryEnd,
          )
        : order.deliveryEstimateSnapshot &&
            /\d{4}-\d{2}-\d{2}/.test(order.deliveryEstimateSnapshot)
          ? order.deliveryEstimateSnapshot
          : null,
    cashChangeAmount:
      typeof order.shippingAddress.cashChangeAmount === "number"
        ? order.shippingAddress.cashChangeAmount
        : null,
    paymentMethod: latestPayment
      ? paymentMethodLabel(latestPayment.method)
      : "—",
    paymentAmount: latestPayment?.amount ?? order.totalAmount,
    items: items.map((item) => ({
      id: item.id,
      title: item.productTitleSnapshot,
      sku: item.productSkuSnapshot,
      imageUrl: item.productImageKeySnapshot
        ? mediaPublicUrl(item.productImageKeySnapshot)
        : null,
      quantity: item.quantity,
      unitPriceAmount: item.unitBaseAmount,
      lineTotalAmount: item.lineTotalAmount,
      currency: item.currency,
      modifiers: item.modifiers,
    })),
    groupParticipants: [],
  };
}

/** Loads order detail shaped for the admin drawer. */
export async function getAdminOrderDetailView(
  orderNumber: string,
  locale: Locale,
): Promise<AdminOrderDetailView | null> {
  const detail = await getAdminOrderByNumber(orderNumber);
  if (!detail) {
    return null;
  }

  const identity = await getStoreIdentity();
  const view = toAdminOrderDetailView(detail, identity.name);

  if (!detail.order.groupOrderId) {
    return view;
  }

  const { paymentMode, participants: groupParticipants } =
    await loadAdminGroupOrderParticipantsView({
      groupOrderId: detail.order.groupOrderId,
      locale,
      currency: detail.order.baseCurrency,
    });

  return {
    ...view,
    groupPaymentMode: paymentMode,
    groupParticipants,
  };
}
