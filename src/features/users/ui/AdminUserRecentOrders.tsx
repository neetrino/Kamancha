"use client";

import { ClipboardList } from "lucide-react";
import { useState, useTransition } from "react";

import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getAdminOrderDetailAction } from "@/features/orders/application/get-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  baseCurrency: string;
};

type AdminUserRecentOrdersProps = {
  locale: string;
  orders: RecentOrder[];
  copy: Dictionary["admin"];
};

export function AdminUserRecentOrders({
  locale,
  orders,
  copy,
}: AdminUserRecentOrdersProps) {
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
      <RecentOrdersCard
        orders={orders}
        copy={copy}
        onOpenOrder={openOrder}
      />
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

function RecentOrdersCard({
  orders,
  copy,
  onOpenOrder,
}: {
  orders: RecentOrder[];
  copy: Dictionary["admin"];
  onOpenOrder: (orderNumber: string) => void;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
          <ClipboardList className="h-5 w-5" aria-hidden />
        </span>
        <h2 className={ADMIN_SECTION_TITLE}>{copy.users.detail.recentOrders}</h2>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-600">{copy.users.detail.noOrders}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
              onClick={() => onOpenOrder(order.orderNumber)}
            >
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm text-gray-900">
                  {order.orderNumber}
                </strong>
                <span
                  className={`${ADMIN_BADGE} ${orderStatusBadgeClass(order.status)}`}
                >
                  {order.status}
                </span>
                <span
                  className={`${ADMIN_BADGE} ${paymentStatusBadgeClass(order.paymentStatus)}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {order.totalAmount.toLocaleString("en-US")} {order.baseCurrency}
              </p>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
