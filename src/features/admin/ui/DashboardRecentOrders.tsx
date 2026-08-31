import Link from "next/link";

import {
  ADMIN_BADGE,
  paymentStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import {
  ADMIN_CARD_CLASS,
  ADMIN_CARD_HOVER_CLASS,
} from "@/features/admin/ui/admin-ui";
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
  labels: Dictionary["admin"]["dashboard"];
};

export function DashboardRecentOrders({
  locale,
  orders,
  labels,
}: DashboardRecentOrdersProps) {
  return (
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
          <Link
            key={order.id}
            href={`/${locale}/admin/orders/${order.orderNumber}`}
            className={`block rounded-[12px] px-3 py-2 ring-1 ring-gray-100/80 ${ADMIN_CARD_HOVER_CLASS}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    #{order.orderNumber}
                  </p>
                  <span
                    className={`${ADMIN_BADGE} ${paymentStatusBadgeClass(order.status)}`}
                  >
                    {order.status}
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
          </Link>
        ))}
        {orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-600">
            {labels.noRecentOrders}
          </p>
        ) : null}
      </div>
    </div>
  );
}
