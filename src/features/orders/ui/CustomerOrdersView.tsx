"use client";

import { useState, useTransition } from "react";

import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getCustomerOrderDetailAction } from "@/features/orders/application/get-customer-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import { CustomerOrdersCards } from "@/features/orders/ui/CustomerOrdersCards";
import { CustomerOrdersTable } from "@/features/orders/ui/CustomerOrdersTable";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type CustomerOrdersViewOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  baseCurrency: string;
  placedAt: string | Date;
  itemsCount: number;
};

type CustomerOrdersViewProps = {
  locale: string;
  orders: CustomerOrdersViewOrder[];
  copy: Dictionary["admin"];
  profileCopy: Pick<
    Dictionary["profile"],
    | "orderNumber"
    | "itemCountOne"
    | "itemCountOther"
    | "placedOn"
    | "viewDetails"
    | "noOrders"
    | "startShopping"
  >;
};

/**
 * Orders list — cards on mobile (dashboard style), table from `lg` up.
 */
export function CustomerOrdersView({
  locale,
  orders,
  copy,
  profileCopy,
}: CustomerOrdersViewProps) {
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
      <div className="xl:hidden">
        <CustomerOrdersCards
          locale={locale as Locale}
          orders={orders}
          labels={profileCopy}
          onOpenOrder={openOrder}
        />
      </div>
      <div className="hidden xl:block">
        <CustomerOrdersTable
          orders={orders}
          emptyLabel={profileCopy.noOrders}
          onOpenOrder={openOrder}
        />
      </div>
      <CustomerOrderDetailsSheet
        open={drawerOpen}
        onClose={closeDrawer}
        detail={detail}
        error={error}
        isLoading={isPending}
        copy={copy}
      />
    </>
  );
}
