"use client";

import {
  localizeOrderStatus,
  localizePaymentStatus,
  type OrderStatusLabels,
} from "@/features/orders/ui/localize-order-status";
import { formatOrderDrawerMoney } from "@/features/orders/ui/order-drawer-format";
import { PROFILE_SECTION } from "@/features/profile/ui/profile-surface";

type CustomerOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  baseCurrency: string;
  placedAt: string | Date;
  isGroupOrder?: boolean;
};

type CustomerOrdersTableProps = {
  orders: CustomerOrderRow[];
  emptyLabel: string;
  groupOrderBadgeLabel?: string;
  statusLabels: OrderStatusLabels;
  onOpenOrder: (orderNumber: string) => void;
};

const ROW_RULE =
  "rounded-bl-[20px] border-l border-b border-white/55 pl-4";

const STATUS_BADGE =
  "inline-flex rounded-[14px] bg-white px-3.5 py-1.5 text-sm font-medium";

function orderStatusTextClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "PENDING" || normalized === "CONFIRMED") {
    return "text-yellow-600";
  }
  if (normalized === "PROCESSING" || normalized === "SHIPPED") {
    return "text-blue-600";
  }
  if (normalized === "DELIVERED") {
    return "text-green-600";
  }
  if (normalized === "CANCELLED" || normalized === "REFUNDED") {
    return "text-red-600";
  }
  return "text-gray-600";
}

function paymentStatusTextClass(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === "PAID" || normalized === "CAPTURED") {
    return "text-green-600";
  }
  if (normalized === "PENDING" || normalized === "AUTHORIZED") {
    return "text-yellow-600";
  }
  if (
    normalized === "FAILED" ||
    normalized === "CANCELLED" ||
    normalized === "REFUNDED"
  ) {
    return "text-red-600";
  }
  return "text-gray-600";
}

export function CustomerOrdersTable({
  orders,
  emptyLabel,
  groupOrderBadgeLabel,
  statusLabels,
  onOpenOrder,
}: CustomerOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <section className={PROFILE_SECTION}>
        <p className="relative z-[2] text-sm text-white">
          {emptyLabel}
        </p>
      </section>
    );
  }

  return (
    <section className={PROFILE_SECTION}>
      <ul className="relative z-[2]">
        {orders.map((order) => (
          <li key={order.id} className={ROW_RULE}>
            <button
              type="button"
              onClick={() => onOpenOrder(order.orderNumber)}
              className="flex w-full flex-col gap-2 py-4 text-left transition-colors hover:opacity-90 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-white">{order.orderNumber}</p>
                {order.isGroupOrder && groupOrderBadgeLabel ? (
                  <p className="mt-0.5 text-xs font-medium text-emerald-200">
                    {groupOrderBadgeLabel}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-white/80">
                  {new Date(order.placedAt)
                    .toISOString()
                    .slice(0, 16)
                    .replace("T", " ")}{" "}
                  UTC
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="text-base font-semibold text-white">
                  {formatOrderDrawerMoney(
                    order.totalAmount,
                    order.baseCurrency,
                  )}
                </span>
                <span
                  className={`${STATUS_BADGE} ${orderStatusTextClass(order.status)}`}
                >
                  {localizeOrderStatus(order.status, statusLabels)}
                </span>
                <span
                  className={`${STATUS_BADGE} ${paymentStatusTextClass(order.paymentStatus)}`}
                >
                  {localizePaymentStatus(order.paymentStatus, statusLabels)}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <p className="relative z-[2] pt-3 pl-4 text-sm text-white">
        {orders.length} order{orders.length === 1 ? "" : "s"} on this page
      </p>
    </section>
  );
}
