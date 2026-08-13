"use client";

import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
  paymentStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import {
  formatOrderDrawerMoney,
  formatOrderStatusLabel,
} from "@/features/orders/ui/order-drawer-format";
import { PROFILE_SECTION } from "@/features/profile/ui/profile-surface";

type CustomerOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  baseCurrency: string;
  placedAt: string | Date;
};

type CustomerOrdersTableProps = {
  orders: CustomerOrderRow[];
  onOpenOrder: (orderNumber: string) => void;
};

export function CustomerOrdersTable({
  orders,
  onOpenOrder,
}: CustomerOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <section className={PROFILE_SECTION}>
        <p className="relative z-[2] text-sm text-gray-700">
          No orders match these filters.
        </p>
      </section>
    );
  }

  return (
    <section className={PROFILE_SECTION}>
      <ul className="relative z-[2] divide-y divide-white/35">
        {orders.map((order) => (
          <li key={order.id}>
            <button
              type="button"
              onClick={() => onOpenOrder(order.orderNumber)}
              className="flex w-full flex-col gap-2 py-4 text-left transition-colors hover:opacity-90 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{order.orderNumber}</p>
                <p className="mt-1 text-xs text-gray-600">
                  {new Date(order.placedAt)
                    .toISOString()
                    .slice(0, 16)
                    .replace("T", " ")}{" "}
                  UTC
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`${ADMIN_BADGE} ${orderStatusBadgeClass(order.status)}`}
                >
                  {formatOrderStatusLabel(order.status)}
                </span>
                <span
                  className={`${ADMIN_BADGE} ${paymentStatusBadgeClass(order.paymentStatus)}`}
                >
                  {formatOrderStatusLabel(order.paymentStatus)}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatOrderDrawerMoney(
                    order.totalAmount,
                    order.baseCurrency,
                  )}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <p className="relative z-[2] border-t border-white/35 pt-3 text-sm text-gray-700">
        {orders.length} order{orders.length === 1 ? "" : "s"} on this page
      </p>
    </section>
  );
}
