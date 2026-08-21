"use client";

import { AppLink } from "@/components/ui/AppLink";
import {
  formatOrderDrawerMoney,
  formatOrderStatusLabel,
} from "@/features/orders/ui/order-drawer-format";
import { ProfileRecentOrderCard } from "@/features/profile/ui/ProfileRecentOrderCard";
import { PROFILE_PILL_LIGHT } from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import { formatShortDate } from "@/lib/i18n/format-date";

type CustomerOrdersCardItem = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  baseCurrency: string;
  placedAt: string | Date;
  itemsCount: number;
};

type CustomerOrdersCardsLabels = {
  orderNumber: string;
  itemCountOne: string;
  itemCountOther: string;
  placedOn: string;
  viewDetails: string;
  noOrders: string;
  startShopping: string;
};

type CustomerOrdersCardsProps = {
  locale: Locale;
  orders: CustomerOrdersCardItem[];
  labels: CustomerOrdersCardsLabels;
  onOpenOrder: (orderNumber: string) => void;
};

function formatItemCount(count: number, one: string, other: string): string {
  const template = count === 1 ? one : other;
  return template.replace("{count}", String(count));
}

/**
 * Profile order cards — same as dashboard (mobile orders sheet / list).
 */
export function CustomerOrdersCards({
  locale,
  orders,
  labels,
  onOpenOrder,
}: CustomerOrdersCardsProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-3xl bg-white py-12 shadow-sm">
        <p className="max-w-sm text-center text-sm text-gray-600">
          {labels.noOrders}
        </p>
        <AppLink
          href={`/${locale}/products`}
          prefetchPolicy="intent"
          className={`${PROFILE_PILL_LIGHT} w-full max-w-xs`}
        >
          {labels.startShopping}
        </AppLink>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4">
      {orders.map((order) => (
        <li key={order.id} className="min-w-0">
          <ProfileRecentOrderCard
            orderNumber={order.orderNumber}
            status={formatOrderStatusLabel(order.status)}
            totalLabel={formatOrderDrawerMoney(
              order.totalAmount,
              order.baseCurrency,
            )}
            metaLine={formatItemCount(
              order.itemsCount,
              labels.itemCountOne,
              labels.itemCountOther,
            )}
            placedOnLine={`${labels.placedOn} ${formatShortDate(order.placedAt, locale)}`}
            orderNumberLabel={labels.orderNumber}
            viewDetailsLabel={labels.viewDetails}
            onViewDetails={() => onOpenOrder(order.orderNumber)}
          />
        </li>
      ))}
    </ul>
  );
}
