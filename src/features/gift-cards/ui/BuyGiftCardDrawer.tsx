"use client";

import { SideSheet } from "@/components/ui/SideSheet";
import { BuyGiftCardForm } from "@/features/gift-cards/ui/BuyGiftCardForm";
import type { GiftCardSettings } from "@/features/gift-cards/domain/gift-card-rules";
import type { Locale } from "@/lib/i18n/config";

type BuyGiftCardDrawerCopy = {
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

type BuyGiftCardDrawerProps = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  settings: GiftCardSettings;
  defaultPurchaserName: string;
  copy: BuyGiftCardDrawerCopy;
};

export function BuyGiftCardDrawer({
  locale,
  open,
  onClose,
  settings,
  defaultPurchaserName,
  copy,
}: BuyGiftCardDrawerProps) {
  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={copy.title}
      panelClassName="w-[87%] max-w-[420px]"
      zIndexClassName="z-[200]"
      backdropBlur
      closeButtonClassName="side-sheet-close-stroke bg-[#335329] text-white hover:bg-[#2c4823]"
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b border-gray-100 px-6 py-5">
          <h2 className="font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {copy.description}
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <BuyGiftCardForm
            locale={locale}
            settings={settings}
            defaultPurchaserName={defaultPurchaserName}
            onSuccess={onClose}
            copy={{
              title: copy.title,
              amount: copy.amount,
              customAmount: copy.customAmount,
              recipientName: copy.recipientName,
              recipientEmail: copy.recipientEmail,
              recipientPhone: copy.recipientPhone,
              purchaserName: copy.purchaserName,
              message: copy.message,
              sendDate: copy.sendDate,
              datePicker: copy.datePicker,
              paymentMethod: copy.paymentMethod,
              cashOnDelivery: copy.cashOnDelivery,
              submit: copy.submit,
              submitting: copy.submitting,
              successPending: copy.successPending,
            }}
          />
        </div>
      </div>
    </SideSheet>
  );
}
