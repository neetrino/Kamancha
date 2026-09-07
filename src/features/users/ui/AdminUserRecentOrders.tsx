"use client";

import { ClipboardList } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getAdminOrderDetailAction } from "@/features/orders/application/get-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  baseCurrency: string;
  bonusEarnedAmount: number;
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
  const [query, setQuery] = useState("");

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

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter((order) => {
      const haystack = [
        order.orderNumber,
        order.status,
        order.paymentStatus,
        order.baseCurrency,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [orders, query]);

  return (
    <>
      <RecentOrdersCard
        locale={locale}
        orders={orders}
        filteredOrders={filteredOrders}
        query={query}
        onQueryChange={setQuery}
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
  locale,
  orders,
  filteredOrders,
  query,
  onQueryChange,
  copy,
  onOpenOrder,
}: {
  locale: string;
  orders: RecentOrder[];
  filteredOrders: RecentOrder[];
  query: string;
  onQueryChange: (value: string) => void;
  copy: Dictionary["admin"];
  onOpenOrder: (orderNumber: string) => void;
}) {
  const detail = copy.users.detail;

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
            <ClipboardList className="h-5 w-5" aria-hidden />
          </span>
          <h2 className={ADMIN_SECTION_TITLE}>{detail.recentOrders}</h2>
        </div>
        {orders.length > 0 ? (
          <AdminSearchInput
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={detail.ordersSearchPlaceholder}
            aria-label={detail.ordersSearchAria}
            className="w-full sm:max-w-xs"
          />
        ) : null}
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-600">{detail.noOrders}</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-sm text-gray-600">{detail.ordersNoMatch}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <button
              key={order.id}
              type="button"
              className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
              onClick={() => onOpenOrder(order.orderNumber)}
            >
              <div className="flex items-start justify-between gap-2">
                <strong className="min-w-0 text-sm text-gray-900">
                  {order.orderNumber}
                </strong>
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
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
              </div>
              <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-gray-600">
                  {order.totalAmount.toLocaleString("en-US")}{" "}
                  {order.baseCurrency}
                </p>
                <p
                  className={
                    order.bonusEarnedAmount > 0
                      ? "text-sm font-semibold text-brand-forest"
                      : "text-sm text-gray-400"
                  }
                >
                  +{formatMoneyAmount(order.bonusEarnedAmount, "AMD", locale)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
