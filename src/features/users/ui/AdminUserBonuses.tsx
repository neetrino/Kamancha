"use client";

import { Coins } from "lucide-react";
import { useState, useTransition } from "react";

import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import type { CustomerBonusSummary } from "@/features/bonuses/application/queries";
import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getAdminOrderDetailAction } from "@/features/orders/application/get-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import { ProfileStatCard } from "@/features/profile/ui/ProfileStatCard";
import { PROFILE_STAT_GRID_THREE } from "@/features/profile/ui/profile-surface";
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

        <div className={`mb-4 overflow-visible ${PROFILE_STAT_GRID_THREE}`}>
          <ProfileStatCard
            variant="mint"
            label={copy.available}
            value={formatMoneyAmount(summary.availableBalance, "AMD", locale)}
          />
          <ProfileStatCard
            variant="mint"
            label={copy.totalEarned}
            value={formatMoneyAmount(summary.totalEarned, "AMD", locale)}
          />
          <ProfileStatCard
            variant="mint"
            label={copy.totalRedeemed}
            value={formatMoneyAmount(summary.totalRedeemed, "AMD", locale)}
          />
        </div>

        {summary.transactions.length === 0 ? (
          <p className="text-sm text-gray-600">{copy.empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 min-[1800px]:grid-cols-5">
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
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
                      {bonusTypeLabel(row.type, copy.types)}
                    </p>
                    {row.orderNumber ? (
                      <p className="shrink-0 text-xs text-gray-500">
                        {copy.order}: {row.orderNumber}
                      </p>
                    ) : null}
                  </div>
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
