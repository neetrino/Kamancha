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
  PROFILE_PILL_GHOST,
  PROFILE_PILL_LIGHT,
  PROFILE_SECTION,
  PROFILE_SECTION_TITLE,
} from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";

type MyGiftCardsViewCopy = {
  title: string;
  buy: string;
  empty: string;
  sections: {
    mine: string;
    usedByMe: string;
    boughtForOthers: string;
  };
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
  viewerUserId: string;
  viewerEmail: string;
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
  viewerUserId,
  viewerEmail,
  defaultPurchaserName,
  details,
  copy,
}: MyGiftCardsViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  const [openHistoryCardId, setOpenHistoryCardId] = useState<string | null>(
    null,
  );
  const [activeSectionId, setActiveSectionId] = useState<"mine" | "used" | "others">(
    "mine",
  );
  const normalizedViewerEmail = viewerEmail.trim().toLowerCase();

  const isOwnedByViewer = (card: GiftCardListItem, detail: GiftCardDetail | null) =>
    detail?.recipientUserId === viewerUserId ||
    card.recipientEmail.trim().toLowerCase() === normalizedViewerEmail;

  const isBoughtByViewer = (
    card: GiftCardListItem,
    detail: GiftCardDetail | null,
  ) =>
    detail?.purchaserUserId === viewerUserId ||
    card.purchaserEmail?.trim().toLowerCase() === normalizedViewerEmail;

  const myCards = details.filter(({ card, detail }) => {
    if (!isOwnedByViewer(card, detail)) {
      return false;
    }
    return card.balanceAmount === card.initialAmount;
  });

  const usedByMeCards = details.filter(({ card, detail }) => {
    if (!isOwnedByViewer(card, detail)) {
      return false;
    }
    return card.balanceAmount < card.initialAmount;
  });

  const boughtForOthersCards = details.filter(({ card, detail }) => {
    if (!isBoughtByViewer(card, detail)) {
      return false;
    }
    return !isOwnedByViewer(card, detail);
  });

  const groupedCards = [
    { id: "mine", title: copy.sections.mine, items: myCards, showBalance: true },
    {
      id: "used",
      title: copy.sections.usedByMe,
      items: usedByMeCards,
      showBalance: true,
    },
    {
      id: "others",
      title: copy.sections.boughtForOthers,
      items: boughtForOthersCards,
      showBalance: false,
    },
  ];
  const hasAnyCards = groupedCards.some((section) => section.items.length > 0);
  const activeSection =
    groupedCards.find((section) => section.id === activeSectionId) ??
    groupedCards[0];

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

        {!hasAnyCards ? (
          <p className={PROFILE_BODY}>{copy.empty}</p>
        ) : (
          <div className="relative z-[2] space-y-5">
            <div className="flex w-full flex-col gap-2.5 sm:flex-row">
              {groupedCards.map((section) => {
                const isActive = section.id === activeSection.id;
                const buttonClass = isActive ? PROFILE_PILL_LIGHT : PROFILE_PILL_GHOST;

                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`${buttonClass} h-auto min-h-10 w-full px-3 py-2 text-center text-xs leading-tight whitespace-normal sm:flex-1`}
                    aria-pressed={isActive}
                    onClick={() => {
                      setActiveSectionId(section.id);
                      setOpenHistoryCardId(null);
                    }}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>

            {activeSection.items.length === 0 ? (
              <p className={PROFILE_BODY}>{copy.empty}</p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-[15px]">
                {activeSection.items.map(({ card, detail }) => (
                  <MyGiftCardItem
                    key={card.id}
                    locale={locale}
                    card={card}
                    detail={detail}
                    showBalance={activeSection.showBalance}
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
          </div>
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
