"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getCustomerOrderDetailAction } from "@/features/orders/application/get-customer-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import { ProfileRecentOrderCard } from "@/features/profile/ui/ProfileRecentOrderCard";
import {
  PROFILE_CARD_GRID,
  PROFILE_PILL_LIGHT,
  PROFILE_SECTION,
} from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatShortDate } from "@/lib/i18n/format-date";
import { formatMoneyAmount } from "@/lib/money/format";

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  itemsCount: number;
  placedAt: string;
};

type ProfileRecentOrdersProps = {
  locale: Locale;
  orders: RecentOrder[];
  dictionary: Dictionary["profile"];
  adminCopy: Dictionary["admin"];
};

function formatItemCount(count: number, one: string, other: string): string {
  const template = count === 1 ? one : other;
  return template.replace("{count}", String(count));
}

function RecentOrdersBody({
  locale,
  orders,
  dictionary,
  onOpenOrder,
}: {
  locale: Locale;
  orders: RecentOrder[];
  dictionary: Dictionary["profile"];
  onOpenOrder: (orderNumber: string) => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="relative z-[2] flex flex-col items-center gap-5 py-12">
        <p className="max-w-sm text-center text-sm text-gray-700">
          {dictionary.noOrders}
        </p>
        <AppLink
          href={`/${locale}/products`}
          prefetchPolicy="intent"
          className={`${PROFILE_PILL_LIGHT} w-full max-w-xs`}
        >
          {dictionary.startShopping}
        </AppLink>
      </div>
    );
  }

  return (
    <ul className={`relative z-[2] ${PROFILE_CARD_GRID}`}>
      {orders.map((order) => (
        <li key={order.id} className="min-w-0">
          <ProfileRecentOrderCard
            orderNumber={order.orderNumber}
            status={order.status}
            totalLabel={formatMoneyAmount(order.totalAmount, "AMD", locale)}
            metaLine={formatItemCount(
              order.itemsCount,
              dictionary.itemCountOne,
              dictionary.itemCountOther,
            )}
            placedOnLine={`${dictionary.placedOn} ${formatShortDate(order.placedAt, locale)}`}
            orderNumberLabel={dictionary.orderNumber}
            viewDetailsLabel={dictionary.viewDetails}
            onViewDetails={() => onOpenOrder(order.orderNumber)}
          />
        </li>
      ))}
    </ul>
  );
}

export function ProfileRecentOrders({
  locale,
  orders,
  dictionary,
  adminCopy,
}: ProfileRecentOrdersProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<AdminOrderDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openOrder(orderNumber: string): void {
    setDrawerOpen(true);
    setDetail(null);
    setError(null);

    startTransition(async () => {
      const result = await getCustomerOrderDetailAction(locale, orderNumber);
      if (!result.ok) {
        setError(result.error.message);
        setDetail(null);
        return;
      }
      setDetail(result.value);
    });
  }

  function closeDrawer(): void {
    setDrawerOpen(false);
    setDetail(null);
    setError(null);
  }

  return (
    <>
      <div className={`profile-recent-orders ${PROFILE_SECTION}`}>
        <div className="relative z-[2] mb-6 flex items-center justify-between gap-4">
          <h2 className="relative z-[2] font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase xl:text-white">
            {dictionary.recentOrders}
          </h2>
          <AppLink
            href={`/${locale}/profile/orders`}
            prefetchPolicy="intent"
            className="inline-flex items-center gap-1 font-big-fat-boii text-sm font-normal tracking-wide text-brand-forest uppercase transition-opacity hover:opacity-80 xl:text-white"
          >
            {dictionary.viewAllOrders}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </AppLink>
        </div>
        <RecentOrdersBody
          locale={locale}
          orders={orders}
          dictionary={dictionary}
          onOpenOrder={openOrder}
        />
      </div>
      <CustomerOrderDetailsSheet
        open={drawerOpen}
        onClose={closeDrawer}
        detail={detail}
        error={error}
        isLoading={isPending}
        copy={adminCopy}
      />
    </>
  );
}
