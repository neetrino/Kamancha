"use client";

import { useState } from "react";

import { BuyGiftCardDrawer } from "@/features/gift-cards/ui/BuyGiftCardDrawer";
import type {
  GiftCardDetail,
  GiftCardListItem,
} from "@/features/gift-cards/application/queries";
import type { GiftCardSettings } from "@/features/gift-cards/domain/gift-card-rules";
import {
  PROFILE_BODY,
  PROFILE_INNER_CARD,
  PROFILE_PILL_LIGHT,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
  PROFILE_STATUS_BADGE,
} from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";

type MyGiftCardsViewCopy = {
  title: string;
  buy: string;
  empty: string;
  history: string;
  status: string;
  balance: string;
  initial: string;
  recipient: string;
  expires: string;
  statuses: Record<string, string>;
  buyDrawer: {
    title: string;
    description: string;
    amount: string;
    customAmount: string;
    recipientName: string;
    recipientEmail: string;
    recipientPhone: string;
    purchaserName: string;
    message: string;
    sendDate: string;
    datePicker: {
      dateTimePlaceholder: string;
      clear: string;
      today: string;
      time: string;
      weekdaysShort: readonly string[];
    };
    paymentMethod: string;
    cashOnDelivery: string;
    submit: string;
    submitting: string;
    successPending: string;
  };
};

type MyGiftCardsViewProps = {
  locale: Locale;
  settings: GiftCardSettings;
  defaultPurchaserName: string;
  details: Array<{
    card: GiftCardListItem;
    detail: GiftCardDetail | null;
  }>;
  copy: MyGiftCardsViewCopy;
};

export function MyGiftCardsView({
  locale,
  settings,
  defaultPurchaserName,
  details,
  copy,
}: MyGiftCardsViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className={PROFILE_SECTION}>
        <div className="relative z-[2] mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-6 lg:border-white/35">
          <h1 className={PROFILE_SECTION_TITLE}>{copy.title}</h1>
          <button
            type="button"
            onClick={() => {
              setDrawerKey((key) => key + 1);
              setDrawerOpen(true);
            }}
            className={`${PROFILE_PILL_LIGHT} w-full shrink-0 sm:w-auto`}
          >
            {copy.buy}
          </button>
        </div>

        {details.length === 0 ? (
          <p className={PROFILE_BODY}>{copy.empty}</p>
        ) : (
          <ul className="relative z-[2] space-y-4">
            {details.map(({ card, detail }) => (
              <li key={card.id} className={`${PROFILE_INNER_CARD} overflow-hidden`}>
                <div className="space-y-3 px-4 py-4 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3 sm:block sm:space-y-2">
                      <p className="font-big-fat-boii text-base font-normal tracking-wide text-gray-900 uppercase">
                        {card.code}
                      </p>
                      <span className={`${PROFILE_STATUS_BADGE} shrink-0`}>
                        {copy.statuses[card.status] ?? card.status}
                      </span>
                    </div>
                    <div className="w-full text-left sm:w-auto sm:text-right">
                      <p className="font-big-fat-boii text-lg font-normal tracking-wide text-brand-forest">
                        {formatMoneyAmount(card.balanceAmount, "AMD", locale)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {copy.initial}:{" "}
                        {formatMoneyAmount(card.initialAmount, "AMD", locale)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {copy.recipient}: {card.recipientName} · {card.recipientEmail}
                  </p>
                  {card.expiresAt ? (
                    <p className="text-xs text-gray-500">
                      {copy.expires}: {card.expiresAt.toISOString().slice(0, 10)}
                    </p>
                  ) : null}
                </div>
                {detail && detail.transactions.length > 0 ? (
                  <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
                    <p className="mb-2 font-big-fat-boii text-xs font-normal tracking-wide text-gray-500 uppercase">
                      {copy.history}
                    </p>
                    <ul className="space-y-2">
                      {detail.transactions.map((row) => (
                        <li
                          key={row.id}
                          className="flex items-center justify-between gap-3 text-xs text-gray-600"
                        >
                          <span>
                            {row.type} ·{" "}
                            {row.createdAt.toISOString().slice(0, 10)}
                          </span>
                          <span className="font-medium text-gray-900">
                            {row.delta > 0 ? "+" : ""}
                            {formatMoneyAmount(row.delta, "AMD", locale)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <BuyGiftCardDrawer
        key={drawerKey}
        locale={locale}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        settings={settings}
        defaultPurchaserName={defaultPurchaserName}
        copy={copy.buyDrawer}
      />
    </div>
  );
}
