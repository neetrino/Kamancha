"use client";

import { MapPin } from "lucide-react";

import { SideSheet } from "@/components/ui/SideSheet";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import {
  formatOrderDrawerMoney,
  formatOrderStatusLabel,
} from "@/features/orders/ui/order-drawer-format";
import { CustomerOrderSheetPayment } from "@/features/orders/ui/CustomerOrderSheetPayment";
import {
  PROFILE_INNER_CARD,
  PROFILE_STATUS_BADGE,
} from "@/features/profile/ui/profile-surface";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { STOREFRONT_PRODUCT_PHOTO } from "@/lib/media/storefront-product-photo";

type CustomerOrderDetailsSheetProps = {
  open: boolean;
  onClose: () => void;
  detail: AdminOrderDetailView | null;
  error: string | null;
  isLoading: boolean;
  copy: Dictionary["admin"];
};

/**
 * Storefront order details sheet — cart/profile visual language (Grill.am-style).
 * Admin keeps `OrderDetailsDrawer`; customers use this panel.
 */
export function CustomerOrderDetailsSheet({
  open,
  onClose,
  detail,
  error,
  isLoading,
  copy,
}: CustomerOrderDetailsSheetProps) {
  const d = copy.orders.drawer;

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={d.ariaLabel}
      panelClassName="w-[87%] max-w-[420px]"
      zIndexClassName="z-[200]"
      backdropBlur
      closeButtonClassName="side-sheet-close-stroke bg-[#335329] text-white hover:bg-[#2c4823]"
    >
      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
          {d.title}
        </h2>
        {detail ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm text-gray-500">#{detail.orderNumber}</p>
            <span className={PROFILE_STATUS_BADGE}>
              {formatOrderStatusLabel(detail.status)}
            </span>
            <span className={PROFILE_STATUS_BADGE}>
              {formatOrderStatusLabel(detail.paymentStatus)}
            </span>
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-[20px] bg-gray-100" />
            <div className="h-24 animate-pulse rounded-[20px] bg-gray-100" />
            <div className="h-32 animate-pulse rounded-[20px] bg-gray-100" />
          </div>
        ) : null}
        {error ? <p className="py-4 text-sm text-red-700">{error}</p> : null}
        {!isLoading && !error && detail ? (
          <CustomerOrderSheetBody detail={detail} labels={d} />
        ) : null}
      </div>

      {!isLoading && !error && detail ? (
        <CustomerOrderSheetTotals detail={detail} labels={d} />
      ) : null}
    </SideSheet>
  );
}

type DrawerLabels = Dictionary["admin"]["orders"]["drawer"];

function CustomerOrderSheetBody({
  detail,
  labels,
}: {
  detail: AdminOrderDetailView;
  labels: DrawerLabels;
}) {
  return (
    <div className="space-y-4">
      <section className={`${PROFILE_INNER_CARD} space-y-3 p-4`}>
        <h3 className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
          {labels.shippingAddress}
        </h3>
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white">
            <MapPin className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="font-medium text-gray-900">{detail.addressLine}</p>
            <p className="text-xs text-gray-500 capitalize">
              {detail.isPickup
                ? detail.storeName
                  ? `${labels.pickupStore} ${detail.storeName}`
                  : detail.shippingMethod
                : labels.delivery}
            </p>
            {detail.scheduledDelivery ? (
              <p className="text-xs text-gray-500">{detail.scheduledDelivery}</p>
            ) : null}
            {detail.addressHint ? (
              <p className="text-xs text-gray-500">{detail.addressHint}</p>
            ) : null}
          </div>
        </div>
        <CustomerOrderSheetPayment detail={detail} labels={labels} />
      </section>


      <section className="space-y-3">
        <h3 className="px-1 font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
          {labels.items}
        </h3>
        <ul className="space-y-3">
          {detail.items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-[20px] border border-gray-200 bg-white p-3"
            >
              <div className="flex items-stretch gap-3">
                <OrderItemThumb title={item.title} imageUrl={item.imageUrl} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="line-clamp-2 text-sm font-medium text-gray-900">
                    {item.title}
                  </p>
                  {item.modifiers.length > 0 ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                      {item.modifiers
                        .map((modifier) =>
                          modifier.kind === "ADDITION"
                            ? `+ ${modifier.name}`
                            : `− ${modifier.name}`,
                        )
                        .join(", ")}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {formatOrderDrawerMoney(
                      item.lineTotalAmount,
                      item.currency,
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatOrderDrawerMoney(item.unitPriceAmount, item.currency)}{" "}
                    × {item.quantity}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function CustomerOrderSheetTotals({
  detail,
  labels,
}: {
  detail: AdminOrderDetailView;
  labels: DrawerLabels;
}) {
  const shippingLabel = detail.isPickup
    ? labels.freeStorePickup
    : formatOrderDrawerMoney(detail.deliveryAmount, detail.baseCurrency);

  const couponRowLabel = detail.couponCode
    ? labels.couponDiscountWithCode.replace("{code}", detail.couponCode)
    : labels.couponDiscount;

  const discountLabel =
    detail.discountAmount > 0
      ? `−${formatOrderDrawerMoney(detail.discountAmount, detail.baseCurrency)}`
      : formatOrderDrawerMoney(0, detail.baseCurrency);

  return (
    <div className="border-t border-gray-200 px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-gray-600">
          <dt>{labels.subtotal}</dt>
          <dd className="tabular-nums text-gray-900">
            {formatOrderDrawerMoney(detail.subtotalAmount, detail.baseCurrency)}
          </dd>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <dt>{labels.delivery}</dt>
          <dd className="tabular-nums text-gray-900">{shippingLabel}</dd>
        </div>
        <div className="flex items-center justify-between text-gray-600">
          <dt>{couponRowLabel}</dt>
          <dd
            className={`tabular-nums ${
              detail.discountAmount > 0 ? "text-green-700" : "text-gray-900"
            }`}
          >
            {discountLabel}
          </dd>
        </div>
        <div className="flex items-center justify-between pt-1 text-base font-bold text-gray-900">
          <dt>{labels.grandTotal}</dt>
          <dd className="tabular-nums">
            {formatOrderDrawerMoney(detail.totalAmount, detail.baseCurrency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function OrderItemThumb({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string | null;
}) {
  const src =
    imageUrl && imageUrl.length > 0 ? imageUrl : STOREFRONT_PRODUCT_PHOTO;

  return (
    // Order/R2 hosts vary — native img avoids brittle next/image allowlists.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      className="h-24 w-24 shrink-0 rounded-2xl object-cover"
    />
  );
}
