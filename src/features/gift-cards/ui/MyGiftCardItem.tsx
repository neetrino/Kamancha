"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Gift,
  History,
  Plus,
  Tag,
  User,
} from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import type {
  GiftCardDetail,
  GiftCardListItem,
  GiftCardTransactionView,
} from "@/features/gift-cards/application/queries";
import { PROFILE_INNER_CARD } from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import { formatLongDate } from "@/lib/i18n/format-date";
import { formatMoneyAmount } from "@/lib/money/format";

type MyGiftCardItemCopy = {
  history: string;
  balance: string;
  initial: string;
  recipient: string;
  expires: string;
  statuses: Record<string, string>;
};

type MyGiftCardItemProps = {
  locale: Locale;
  card: GiftCardListItem;
  detail: GiftCardDetail | null;
  copy: MyGiftCardItemCopy;
};

function formatDateOnly(
  value: Date | null,
  locale: Locale,
): string | null {
  if (!value) {
    return null;
  }
  return formatLongDate(value, locale);
}

function statusBadgeClass(status: GiftCardListItem["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "bg-brand-forest/10 text-brand-forest";
    case "PENDING_PAYMENT":
      return "bg-amber-50 text-amber-800";
    case "DISABLED":
      return "bg-red-50 text-red-700";
    case "USED":
    case "EXPIRED":
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function statusDotClass(status: GiftCardListItem["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "bg-brand-forest";
    case "PENDING_PAYMENT":
      return "bg-amber-500";
    case "DISABLED":
      return "bg-red-500";
    default:
      return "bg-gray-400";
  }
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="flex size-5 shrink-0 items-center justify-center text-brand-forest">
        {icon}
      </span>
      <span className="shrink-0 text-gray-500">{label}:</span>
      <span className="min-w-0 flex-1 truncate text-right font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}

function TransactionIcon({
  type,
  delta,
}: {
  type: GiftCardTransactionView["type"];
  delta: number;
}) {
  const isCredit = delta > 0;
  const Icon =
    type === "ISSUE" ? Plus : isCredit ? ArrowUpRight : ArrowDownLeft;

  return (
    <span
      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
        isCredit
          ? "bg-brand-forest/10 text-brand-forest"
          : "bg-gray-100 text-gray-700"
      }`}
    >
      <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
    </span>
  );
}

function TransactionRow({
  row,
  locale,
}: {
  row: GiftCardTransactionView;
  locale: Locale;
}) {
  const isCredit = row.delta > 0;
  const amount = formatMoneyAmount(Math.abs(row.delta), "AMD", locale);

  return (
    <li className="flex items-center gap-3">
      <TransactionIcon type={row.type} delta={row.delta} />
      <span className="min-w-0 flex-1 truncate text-sm text-gray-600">
        {row.type} · {formatDateOnly(row.createdAt, locale)}
      </span>
      <span
        className={`shrink-0 text-sm font-semibold tabular-nums ${
          isCredit ? "text-brand-forest" : "text-gray-900"
        }`}
      >
        {isCredit ? "+" : "−"}
        {amount}
      </span>
    </li>
  );
}

export function MyGiftCardItem({
  locale,
  card,
  detail,
  copy,
}: MyGiftCardItemProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyPanelId = useId();
  const statusLabel = copy.statuses[card.status] ?? card.status;
  const expiresLabel = formatDateOnly(card.expiresAt, locale);
  const transactions = detail?.transactions ?? [];

  return (
    <li
      className={`${PROFILE_INNER_CARD} overflow-hidden rounded-3xl border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]`}
    >
      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-forest text-white">
            <Gift className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-2">
            <p className="font-big-fat-boii text-lg leading-none font-normal tracking-wide text-gray-900 uppercase sm:text-xl">
              {card.code}
            </p>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(card.status)}`}
            >
              <span
                className={`size-1.5 rounded-full ${statusDotClass(card.status)}`}
                aria-hidden
              />
              {statusLabel}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500">{copy.balance}</p>
          <p className="mt-1 font-big-fat-boii text-3xl leading-none font-normal tracking-wide text-brand-forest sm:text-4xl">
            {formatMoneyAmount(card.balanceAmount, "AMD", locale)}
          </p>
        </div>

        <div className="space-y-3 border-t border-dashed border-gray-200 pt-4">
          <DetailRow
            icon={<Tag className="size-4" aria-hidden />}
            label={copy.initial}
            value={formatMoneyAmount(card.initialAmount, "AMD", locale)}
          />
          <DetailRow
            icon={<User className="size-4" aria-hidden />}
            label={copy.recipient}
            value={`${card.recipientName} · ${card.recipientEmail}`}
          />
          {expiresLabel ? (
            <DetailRow
              icon={<Calendar className="size-4" aria-hidden />}
              label={copy.expires}
              value={expiresLabel}
            />
          ) : null}
        </div>

        {transactions.length > 0 ? (
          <div className="border-t border-gray-100 pt-4">
            <button
              type="button"
              className="flex w-full items-center gap-2 text-left"
              aria-expanded={historyOpen}
              aria-controls={historyPanelId}
              onClick={() => setHistoryOpen((open) => !open)}
            >
              <History
                className="size-4 shrink-0 text-brand-forest"
                aria-hidden
              />
              <span className="min-w-0 flex-1 font-big-fat-boii text-sm font-normal tracking-wide text-gray-900">
                {copy.history}
              </span>
              <ChevronDown
                className={`size-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                  historyOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            {historyOpen ? (
              <ul id={historyPanelId} className="mt-3 space-y-3">
                {transactions.map((row) => (
                  <TransactionRow key={row.id} row={row} locale={locale} />
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}
