"use client";

import { Coins } from "lucide-react";
import { useState, useTransition } from "react";

import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import type { CustomerBonusSummary } from "@/features/bonuses/application/queries";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getAdminOrderDetailAction } from "@/features/orders/application/get-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatShortDateTime } from "@/lib/i18n/format-date";
import { formatMoneyAmount } from "@/lib/money/format";

type AdminUserBonusesProps = {
  locale: Locale;
  summary: CustomerBonusSummary;
  copy: Dictionary["admin"]["users"]["detail"]["bonuses"];
  adminCopy: Dictionary["admin"];
};

function bonusTypeLabel(
  type: string,
  labels: Record<string, string>,
): string {
  return labels[type] ?? type;
}

export function AdminUserBonuses({
  locale,
  summary,
  copy,
  adminCopy,
}: AdminUserBonusesProps) {
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
            <Coins className="h-5 w-5" aria-hidden />
          </span>
          <h2 className={ADMIN_SECTION_TITLE}>{copy.title}</h2>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <BonusStat label={copy.available} value={summary.availableBalance} locale={locale} />
          <BonusStat label={copy.totalEarned} value={summary.totalEarned} locale={locale} />
          <BonusStat label={copy.totalRedeemed} value={summary.totalRedeemed} locale={locale} />
        </div>

        {summary.transactions.length === 0 ? (
          <p className="text-sm text-gray-600">{copy.empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summary.transactions.map((row) => {
              const positive = row.delta > 0;
              const canOpenOrder = row.orderNumber != null;
              return (
                <button
                  key={row.id}
                  type="button"
                  disabled={!canOpenOrder}
                  className={`rounded-lg border border-gray-200 p-3 text-left transition-colors ${
                    canOpenOrder ? "hover:bg-gray-50" : "cursor-default"
                  }`}
                  onClick={
                    canOpenOrder
                      ? () => openOrder(row.orderNumber!)
                      : undefined
                  }
                >
                  <p className="text-sm font-medium text-gray-900">
                    {bonusTypeLabel(row.type, copy.types)}
                  </p>
                  <div className="mt-1 flex items-baseline justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        positive ? "text-brand-forest" : "text-red-600"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {formatMoneyAmount(row.delta, "AMD", locale)}
                    </span>
                    <span className="shrink-0 text-xs text-gray-500">
                      {formatShortDateTime(row.createdAt, locale)}
                    </span>
                  </div>
                  {row.orderNumber ? (
                    <p className="mt-1 text-xs text-gray-500">
                      {copy.order}: {row.orderNumber}
                    </p>
                  ) : null}
                </button>
              );
            })}
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
      />
    </>
  );
}

function BonusStat({
  label,
  value,
  locale,
}: {
  label: string;
  value: number;
  locale: Locale;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {formatMoneyAmount(value, "AMD", locale)}
      </p>
    </div>
  );
}
