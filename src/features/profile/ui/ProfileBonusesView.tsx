"use client";

import { useState, useTransition } from "react";

import type { AdminOrderDetailView } from "@/features/orders/application/order-detail-view";
import { getCustomerOrderDetailAction } from "@/features/orders/application/get-customer-order-detail";
import { CustomerOrderDetailsSheet } from "@/features/orders/ui/CustomerOrderDetailsSheet";
import { ProfileStatCard } from "@/features/profile/ui/ProfileStatCard";
import {
  PROFILE_BODY,
  PROFILE_INNER_CARD,
  PROFILE_LINK,
  PROFILE_PAGE_TITLE,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
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
            <ul className="relative z-[2] space-y-3">
              {transactions.map((row) => {
                const positive = row.delta > 0;
                return (
                  <li
                    key={row.id}
                    className={`${PROFILE_INNER_CARD} flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="font-big-fat-boii text-sm font-normal tracking-wide text-gray-900 uppercase">
                        {typeLabel(row.type, copy.types)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {row.createdAt.slice(0, 16).replace("T", " ")} UTC
                        {row.orderNumber ? (
                          <>
                            {" · "}
                            <button
                              type="button"
                              onClick={() => openOrder(row.orderNumber!)}
                              className={PROFILE_LINK}
                            >
                              {copy.order} {row.orderNumber}
                            </button>
                          </>
                        ) : null}
                      </p>
                      {row.type === "EARN" ? (
                        <p className="text-xs text-gray-500">
                          {row.expiresAt
                            ? copy.expires.replace(
                                "{date}",
                                row.expiresAt.slice(0, 10),
                              )
                            : copy.noExpiry}
                        </p>
                      ) : null}
                    </div>
                    <p
                      className={
                        positive
                          ? "font-big-fat-boii text-base font-normal tracking-wide text-brand-forest"
                          : "font-big-fat-boii text-base font-normal tracking-wide text-gray-900"
                      }
                    >
                      {positive ? "+" : ""}
                      {formatMoneyAmount(row.delta, "AMD", locale)}
                    </p>
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
