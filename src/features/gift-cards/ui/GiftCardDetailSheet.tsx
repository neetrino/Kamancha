"use client";

import { SideSheet } from "@/components/ui/SideSheet";
import type { GiftCardDetail } from "@/features/gift-cards/application/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type GiftCardDetailSheetCopy = {
  giftCards: Dictionary["admin"]["giftCards"];
  common: Dictionary["admin"]["common"];
};

type GiftCardDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  detail: GiftCardDetail | null;
  isLoading: boolean;
  locale: string;
  copy: GiftCardDetailSheetCopy;
};

function formatDateOnly(
  value: Date | string | null | undefined,
  noneLabel: string,
): string {
  if (!value) {
    return noneLabel;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return noneLabel;
  }
  return date.toISOString().slice(0, 10);
}

function formatDateTime(
  value: Date | string,
  utcLabel: string,
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return `${date.toISOString().slice(0, 16).replace("T", " ")} ${utcLabel}`;
}

export function GiftCardDetailSheet({
  open,
  onClose,
  detail,
  isLoading,
  locale,
  copy,
}: GiftCardDetailSheetProps) {
  const { giftCards, common } = copy;

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={giftCards.sheetAria}
      panelClassName="w-full max-w-md"
    >
      <div className="border-b border-gray-200 px-5 py-4">
        {detail ? (
          <>
            <h2 className="font-mono text-lg font-semibold tracking-wide text-gray-900">
              {detail.code}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {giftCards.statuses[detail.status] ?? detail.status}
            </p>
          </>
        ) : (
          <h2 className="text-lg font-semibold text-gray-900">
            {giftCards.sheetTitle}
          </h2>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
            <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        ) : null}

        {!isLoading && detail ? (
          <div className="space-y-6">
            <dl className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-gray-500">{giftCards.table.balance}</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatMoneyAmount(detail.balanceAmount, "AMD", locale)} /{" "}
                  {formatMoneyAmount(detail.initialAmount, "AMD", locale)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">{giftCards.table.recipient}</dt>
                <dd className="text-sm text-gray-900">
                  {detail.recipientName} · {detail.recipientEmail}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">{giftCards.table.purchaser}</dt>
                <dd className="text-sm text-gray-900">
                  {detail.purchaserName}
                  {detail.purchaserEmail ? ` · ${detail.purchaserEmail}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">
                  {giftCards.drawer.expiresOptional}
                </dt>
                <dd className="text-sm text-gray-900">
                  {formatDateOnly(detail.expiresAt, common.none)}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="mb-3 text-base font-semibold text-gray-900">
                {giftCards.history}
              </h3>
              {detail.transactions.length === 0 ? (
                <p className="text-sm text-gray-600">{giftCards.empty}</p>
              ) : (
                <ul className="divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  {detail.transactions.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{row.type}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(row.createdAt, common.utc)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {row.delta > 0 ? "+" : ""}
                        {formatMoneyAmount(row.delta, "AMD", locale)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </SideSheet>
  );
}
