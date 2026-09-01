"use client";

import { useState, useTransition, type KeyboardEvent } from "react";

import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getCustomerOrderDetailAction } from "@/features/orders/application/get-customer-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import { ProfileStatCard } from "@/features/profile/ui/ProfileStatCard";
import {
  PROFILE_BODY,
  PROFILE_CARD_GRID,
  PROFILE_INNER_CARD,
  PROFILE_PAGE_TITLE,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
  PROFILE_STAT_GRID_THREE,
} from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatShortDateTime } from "@/lib/i18n/format-date";
import { formatMoneyAmount } from "@/lib/money/format";

type BonusTransactionRow = {
  id: string;
  type: string;
  delta: number;
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

function handleCardKeyDown(
  event: KeyboardEvent<HTMLElement>,
  onOpen: () => void,
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onOpen();
  }
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

        <div className={`${PROFILE_STAT_GRID_THREE} overflow-visible`}>
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

        <div className={`profile-bonuses-history ${PROFILE_SECTION}`}>
          <div className="relative z-[2] mb-6 border-b border-gray-100 pb-5 sm:mb-8 sm:pb-6 xl:border-white/35">
            <h2 className={PROFILE_SECTION_TITLE}>{copy.history}</h2>
          </div>

          {transactions.length === 0 ? (
            <p className={PROFILE_BODY}>{copy.empty}</p>
          ) : (
            <ul className={`relative z-[2] ${PROFILE_CARD_GRID}`}>
              {transactions.map((row) => {
                const positive = row.delta > 0;
                const canOpenOrder = row.orderNumber != null;
                return (
                  <li key={row.id} className="min-w-0">
                    <div
                      role={canOpenOrder ? "button" : undefined}
                      tabIndex={canOpenOrder ? 0 : undefined}
                      onClick={
                        canOpenOrder
                          ? () => openOrder(row.orderNumber!)
                          : undefined
                      }
                      onKeyDown={
                        canOpenOrder
                          ? (event) =>
                              handleCardKeyDown(event, () =>
                                openOrder(row.orderNumber!),
                              )
                          : undefined
                      }
                      className={`${PROFILE_INNER_CARD} flex h-full min-w-0 flex-col p-4 sm:p-5 ${
                        canOpenOrder
                          ? "cursor-pointer transition-transform duration-200 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                          : ""
                      }`}
                    >
                      <p className="min-w-0 font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
                        {typeLabel(row.type, copy.types)}
                      </p>
                      <div className="mt-2 flex items-baseline justify-between gap-3">
                        <p
                          className={
                            positive
                              ? "font-big-fat-boii text-lg leading-none font-normal tracking-wide text-brand-forest sm:text-xl"
                              : "font-big-fat-boii text-lg leading-none font-normal tracking-wide text-red-600 sm:text-xl"
                          }
                        >
                          {positive ? "+" : ""}
                          {formatMoneyAmount(row.delta, "AMD", locale)}
                        </p>
                        <p className="shrink-0 text-xs text-gray-500">
                          {formatShortDateTime(row.createdAt, locale)}
                        </p>
                      </div>
                    </div>
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
