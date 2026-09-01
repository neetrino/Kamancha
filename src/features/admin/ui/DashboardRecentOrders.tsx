"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import {
  ADMIN_CARD_CLASS,
  ADMIN_CARD_HOVER_CLASS,
} from "@/features/admin/ui/admin-ui";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getAdminOrderDetailAction } from "@/features/orders/application/get-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import { localizeOrderStatus } from "@/features/orders/ui/localize-order-status";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

export type DashboardRecentOrderItem = {
  id: string;
  orderNumber: string;
  status: string;
  contactEmail: string;
  totalAmount: number;
};

type DashboardRecentOrdersProps = {
  locale: string;
  orders: DashboardRecentOrderItem[];
  copy: Dictionary["admin"];
};

/**
 * Admin dashboard recent orders — opens the same details sheet as the orders list.
 */
export function DashboardRecentOrders({
  locale,
  orders,
  copy,
}: DashboardRecentOrdersProps) {
  const labels = copy.dashboard;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<AdminOrderDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openOrder(orderNumber: string): void {
    setDrawerOpen(true);
    setDetail(null);
    setError(null);

    startTransition(async () => {
      const result = await getAdminOrderDetailAction(locale, orderNumber);
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
      <div className={`${ADMIN_CARD_CLASS} p-4`}>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            {labels.recentOrders}
          </h2>
          <Link
            href={`/${locale}/admin/orders`}
            className="rounded-[12px] px-2 py-1 text-xs font-medium text-brand-forest hover:bg-brand-forest/5"
          >
            {labels.viewAll}
          </Link>
        </div>
        <div className="space-y-2">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => openOrder(order.orderNumber)}
              className={`block w-full rounded-[12px] px-3 py-2 text-left ring-1 ring-gray-100/80 ${ADMIN_CARD_HOVER_CLASS}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <span
                      className={`${ADMIN_BADGE} ${orderStatusBadgeClass(order.status)}`}
                    >
                      {localizeOrderStatus(
                        order.status,
                        copy.orders.statusLabels,
                      )}
                    </span>
                  </div>
                  <p className="truncate text-[11px] text-gray-500">
                    {order.contactEmail}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-gray-900">
                  {formatMoneyAmount(order.totalAmount, "AMD", locale)}
                </p>
              </div>
            </button>
          ))}
          {orders.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-600">
              {labels.noRecentOrders}
            </p>
          ) : null}
        </div>
      </div>
      <CustomerOrderDetailsSheet
        open={drawerOpen}
        onClose={closeDrawer}
        detail={detail}
        error={error}
        isLoading={isPending}
        copy={copy}
        includeAdminDetails
      />
    </>
  );
}
