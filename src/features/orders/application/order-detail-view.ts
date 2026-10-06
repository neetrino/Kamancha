import "server-only";

import { formatDeliverySlotDisplay } from "@/features/delivery/domain/delivery-schedule";
import {
  loadAdminGroupOrderParticipantsView,
  type AdminGroupOrderParticipantView,
} from "@/features/orders/application/group-order-participants-view";
import type { OrderOperatorNote } from "@/features/orders/domain/operator-note";
import { splitOrderItemTitle } from "@/features/orders/domain/order-item-label";
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
  /** Chosen variant or attribute label. Null when the line has neither. */
  optionLabel: string | null;
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
  /** Note left by the customer at checkout, when provided (legacy). */
  customerNote: string | null;
  /** Customer 1–5 rating after admin confirmation. */
  customerRating: number | null;
  /** Comment submitted with the customer rating. */
  customerFeedback: string | null;
  /** Whether the signed-in order owner may still submit feedback. */
  canSubmitFeedback: boolean;
  /** Formatted slot label for display, when scheduled. */
  scheduledDelivery: string | null;
  /** Raw scheduled delivery date `YYYY-MM-DD`, when set. */
  scheduledDeliveryDate: string | null;
  /** Slot start `HH:mm`, when set. */
  scheduledDeliveryStart: string | null;
  /** Slot end `HH:mm`, when set. */
  scheduledDeliveryEnd: string | null;
  cashChangeAmount: number | null;
  paymentMethod: string;
  paymentAmount: number;
  items: AdminOrderDetailItemView[];
  groupParticipants: AdminGroupOrderParticipantView[];
  /** Operator notes shown read-only to the order owner (profile drawer only). */
  customerNotes?: OrderOperatorNote[];
};

/** Geocoder segments come as "Yerevan 0025"; postal codes are not displayed. */
function withoutPostalCode(segment: string): string {
  return segment.trim().replace(/(?:^|\s)\d{4,6}$/, "").trim();
}

/**
 * Displayed as "street, delivery zone". `line1` holds the geocoder formatted
 * address; only the street segment is kept. The selected delivery zone is
 * always appended when available so district context is not lost.
 */
function formatAddressLine(
  address: AdminOrderDetail["order"]["shippingAddress"],
  deliveryZoneLabel: string | null,
): string {
  const lineSegments = (address.line1 ?? "")
    .split(",")
    .map((segment) => withoutPostalCode(segment))
    .filter((segment) => segment.length > 0);

  const street = [lineSegments[0], address.line2?.trim()]
    .filter((part): part is string => Boolean(part))
    .join(", ");
  const zone =
    deliveryZoneLabel?.trim() || withoutPostalCode(address.city ?? "") || "";

  if (!zone) {
    return street;
  }
  if (!street) {
    return zone;
  }
  if (street.toLowerCase().includes(zone.toLowerCase())) {
    return street;
  }
  return `${street}, ${zone}`;
}

async function resolveDeliveryZoneLabel(
  order: AdminOrderDetail["order"],
  locale: Locale,
): Promise<string | null> {
  if (order.deliveryRuleId) {
    const { resolveZoneDelivery } = await import(
      "@/features/delivery/application/resolve-zone-delivery"
    );
    const resolved = await resolveZoneDelivery(order.deliveryRuleId, locale);
    if (resolved.ok) {
      return resolved.quote.zoneName;
    }
  }
  return order.deliveryLabelSnapshot;
}

/** Maps a loaded order into a serializable admin drawer view. */
export async function toAdminOrderDetailView(
  detail: AdminOrderDetail,
  storeName: string,
  locale: Locale,
): Promise<AdminOrderDetailView> {
  const { order, items, payments } = detail;
  const isPickup = order.deliveryLabelSnapshot === "Store pickup";
  const latestPayment = payments[0] ?? null;
  const deliveryZoneLabel = isPickup
    ? null
    : await resolveDeliveryZoneLabel(order, locale);

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
    deliveryLabel: deliveryZoneLabel,
    couponCode: order.promotionCodeSnapshot,
    isPickup,
    isGroupOrder: order.groupOrderId != null,
    groupPaymentMode: null,
    storeName,
    shippingMethod: isPickup
      ? "pickup"
      : (deliveryZoneLabel ?? "delivery"),
    addressLine: formatAddressLine(order.shippingAddress, deliveryZoneLabel),
    addressHint: isPickup
      ? "You can pick up your order at this store"
      : null,
    floor: order.shippingAddress.floor?.trim() || null,
    intercomCode: order.shippingAddress.intercomCode?.trim() || null,
    customerNote: order.shippingAddress.customerNote?.trim() || null,
    customerRating: order.customerRating ?? null,
    customerFeedback: order.customerFeedback?.trim() || null,
    canSubmitFeedback: false,
    scheduledDeliveryDate:
      order.shippingAddress.scheduledDeliveryDate?.trim() || null,
    scheduledDeliveryStart:
      order.shippingAddress.scheduledDeliveryStart?.trim() || null,
    scheduledDeliveryEnd:
      order.shippingAddress.scheduledDeliveryEnd?.trim() || null,
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
    items: items.map((item) => {
      const line = splitOrderItemTitle(
        item.productTitleSnapshot,
        item.variantLabelSnapshot,
      );
      return {
        id: item.id,
        title: line.title,
        optionLabel: line.optionLabel,
        sku: item.productSkuSnapshot,
        imageUrl: item.productImageKeySnapshot
          ? mediaPublicUrl(item.productImageKeySnapshot)
          : null,
        quantity: item.quantity,
        unitPriceAmount: item.unitBaseAmount,
        lineTotalAmount: item.lineTotalAmount,
        currency: item.currency,
        modifiers: item.modifiers,
      };
    }),
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
  const view = await toAdminOrderDetailView(detail, identity.name, locale);

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
