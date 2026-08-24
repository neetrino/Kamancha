"use client";

import { ArrowRight } from "lucide-react";
import { useState, useTransition } from "react";

import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getCustomerOrderDetailAction } from "@/features/orders/application/get-customer-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import { ProfileStatCard } from "@/features/profile/ui/ProfileStatCard";
import {
  PROFILE_BODY,
  PROFILE_INNER_CARD,
  PROFILE_PAGE_TITLE,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
  PROFILE_STATUS_BADGE,
} from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatShortDate, formatShortDateTime } from "@/lib/i18n/format-date";
import { formatMoneyAmount } from "@/lib/money/format";

type BonusTransactionRow = {
  id: string;
  type: string;
  delta: number;
  expiresAt: string | null;
  createdAt: string;
  orderNumber: string | null;
};

type ProfileBonusesViewProps = {
  locale: Locale;
  title: string;
  availableBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  transactions: BonusTransactionRow[];
  copy: Dictionary["profile"]["bonusesPage"];
  adminCopy: Dictionary["admin"];
};

function typeLabel(type: string, labels: Record<string, string>): string {
  return labels[type] ?? type;
}

function earnExpiryBadgeLabel(
  expiresAt: string | null,
  copy: Dictionary["profile"]["bonusesPage"],
  locale: Locale,
): string {
  if (!expiresAt) {
    return copy.noExpiry;
  }
  return copy.expires.replace("{date}", formatShortDate(expiresAt, locale));
}

export function ProfileBonusesView({
  locale,
  title,
  availableBalance,
  totalEarned,
  totalRedeemed,
  transactions,
  copy,
  adminCopy,
}: ProfileBonusesViewProps) {
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
      <section className="profile-sheet-keep-frame space-y-8">
        <h1 className={PROFILE_PAGE_TITLE}>{title}</h1>

        <div className="grid grid-cols-1 gap-3 overflow-visible sm:grid-cols-3 sm:gap-4">
          <ProfileStatCard
            label={copy.available}
            value={formatMoneyAmount(availableBalance, "AMD", locale)}
          />
          <ProfileStatCard
            label={copy.totalEarned}
            value={formatMoneyAmount(totalEarned, "AMD", locale)}
          />
          <ProfileStatCard
            label={copy.totalRedeemed}
            value={formatMoneyAmount(totalRedeemed, "AMD", locale)}
          />
        </div>

        <div className={PROFILE_SECTION}>
          <div className="relative z-[2] mb-6 border-b border-gray-100 pb-5 sm:mb-8 sm:pb-6 lg:border-white/35">
            <h2 className={PROFILE_SECTION_TITLE}>{copy.history}</h2>
          </div>

          {transactions.length === 0 ? (
            <p className={PROFILE_BODY}>{copy.empty}</p>
          ) : (
            <ul className="relative z-[2] grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-[15px]">
              {transactions.map((row) => {
                const positive = row.delta > 0;
                return (
                  <li
                    key={row.id}
                    className={`${PROFILE_INNER_CARD} flex h-full min-w-0 flex-col p-4 sm:p-5`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
                        {typeLabel(row.type, copy.types)}
                      </p>
                      {row.type === "EARN" ? (
                        <span className={`${PROFILE_STATUS_BADGE} shrink-0 normal-case`}>
                          {earnExpiryBadgeLabel(row.expiresAt, copy, locale)}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={
                        positive
                          ? "mt-2 font-big-fat-boii text-lg leading-none font-normal tracking-wide text-brand-forest sm:text-xl"
                          : "mt-2 font-big-fat-boii text-lg leading-none font-normal tracking-wide text-gray-900 sm:text-xl"
                      }
                    >
                      {positive ? "+" : ""}
                      {formatMoneyAmount(row.delta, "AMD", locale)}
                    </p>

                    <div className="my-4 h-px rounded-full bg-gray-200" aria-hidden />

                    <div className="space-y-1.5 text-xs text-gray-500">
                      <p>{formatShortDateTime(row.createdAt, locale)}</p>
                    </div>

                    {row.orderNumber ? (
                      <div className="mt-auto pt-5">
                        <button
                          type="button"
                          onClick={() => openOrder(row.orderNumber!)}
                          className="flex min-h-9 w-full items-center gap-2 rounded-full bg-brand-forest py-0.5 pr-0.5 pl-3 font-big-fat-boii text-xs font-normal tracking-wide text-white uppercase"
                        >
                          <span className="min-w-0 flex-1 truncate text-center">
                            {copy.order} {row.orderNumber}
                          </span>
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-brand-forest">
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </span>
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <CustomerOrderDetailsSheet
        open={drawerOpen}
        onClose={closeDrawer}
        detail={detail}
        error={error}
        isLoading={isPending}
        copy={adminCopy}
      />
    </>
  );
}
