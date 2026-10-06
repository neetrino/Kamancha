"use client";

import { Ticket } from "lucide-react";
import { useState, useTransition } from "react";

import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import {
  ADMIN_BADGE,
  orderStatusBadgeClass,
} from "@/features/admin/ui/status-badge";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getAdminOrderDetailAction } from "@/features/orders/application/get-order-detail";
import {
  ADMIN_ORDER_SHEET_PANEL,
  CustomerOrderDetailsSheet,
} from "@/features/orders/ui/CustomerOrderDetailsSheet";
import type { AdminUserCouponUse } from "@/features/users/application/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatShortDateTime } from "@/lib/i18n/format-date";
import { formatMoneyAmount } from "@/lib/money/format";

type AdminUserCouponsProps = {
  locale: Locale;
  coupons: AdminUserCouponUse[];
  copy: Dictionary["admin"]["users"]["detail"]["coupons"];
  adminCopy: Dictionary["admin"];
};

export function AdminUserCoupons({
  locale,
  coupons,
  copy,
  adminCopy,
}: AdminUserCouponsProps) {
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
      <Card className="mb-6 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
            <Ticket className="h-5 w-5" aria-hidden />
          </span>
          <h2 className={ADMIN_SECTION_TITLE}>{copy.title}</h2>
        </div>

        {coupons.length === 0 ? (
          <p className="text-sm text-gray-600">{copy.empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5">
            {coupons.map((row) => (
              <button
                key={row.id}
                type="button"
                className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                onClick={() => openOrder(row.orderNumber)}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
                    {row.code}
                  </p>
                  <span
                    className={`${ADMIN_BADGE} ${orderStatusBadgeClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {copy.order}: {row.orderNumber}
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-brand-forest">
                    −{formatMoneyAmount(row.discountAmount, "AMD", locale)}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {formatShortDateTime(row.placedAt, locale)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <CustomerOrderDetailsSheet
        open={drawerOpen}
        onClose={closeDrawer}
        detail={detail}
        error={error}
        isLoading={isPending}
        copy={adminCopy}
        includeAdminDetails
        locale={locale}
        panelClassName={ADMIN_ORDER_SHEET_PANEL}
      />
    </>
  );
}
