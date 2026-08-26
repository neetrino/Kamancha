"use client";

import { useState } from "react";

import { BuyGiftCardDrawer } from "@/features/gift-cards/ui/BuyGiftCardDrawer";
import type {
  GiftCardDetail,
  GiftCardListItem,
} from "@/features/gift-cards/application/queries";
import type { GiftCardSettings } from "@/features/gift-cards/domain/gift-card-rules";
import { MyGiftCardItem } from "@/features/gift-cards/ui/MyGiftCardItem";
import {
  PROFILE_BODY,
  PROFILE_PILL_LIGHT,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";

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
  const [openHistoryCardId, setOpenHistoryCardId] = useState<string | null>(
    null,
  );

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
          <ul className="relative z-[2] grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-[15px]">
            {details.map(({ card, detail }) => (
              <MyGiftCardItem
                key={card.id}
                locale={locale}
                card={card}
                detail={detail}
                historyOpen={openHistoryCardId === card.id}
                onHistoryOpenChange={(open) => {
                  setOpenHistoryCardId(open ? card.id : null);
                }}
                copy={{
                  history: copy.history,
                  balance: copy.balance,
                  initial: copy.initial,
                  recipient: copy.recipient,
                  expires: copy.expires,
                  statuses: copy.statuses,
                }}
              />
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
