"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import { AdminDateTimePickerField } from "@/features/admin/ui/AdminDateTimePickerField";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
} from "@/features/admin/ui/admin-form-classes";
import {
  CheckoutPaymentMethodOption,
  type CheckoutPaymentOption,
} from "@/features/checkout/ui/CheckoutPaymentMethodOption";
import { adminCreateGiftCardAction } from "@/features/gift-cards/application/admin-actions";
import type { GiftCardPaymentMethod } from "@/features/gift-cards/domain/gift-card-payment-method";
import type { GiftCardPaymentLabels } from "@/features/gift-cards/ui/BuyGiftCardForm";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type GiftCardDrawerCopy = {
  drawer: Dictionary["admin"]["giftCards"]["drawer"];
  common: Dictionary["admin"]["common"];
  payment: GiftCardPaymentLabels;
};

type GiftCardDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  presets: number[];
  copy: GiftCardDrawerCopy;
};

export function GiftCardDrawer({
  locale,
  open,
  onClose,
  presets,
  copy,
}: GiftCardDrawerProps) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(presets[0] ?? 20000));
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [purchaserName, setPurchaserName] = useState("White Shop");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<GiftCardPaymentMethod>("cash_on_delivery");
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const paymentOptions = useMemo<CheckoutPaymentOption[]>(
    () => [
      {
        id: "cash_on_delivery",
        name: copy.payment.cashOnDelivery,
        shortName: copy.payment.cashShort,
        description: copy.payment.cashOnDeliveryDescription,
      },
      {
        id: "arca",
        name: copy.payment.card,
        shortName: copy.payment.card,
        description: copy.payment.cardDescription,
      },
    ],
    [copy.payment],
  );

  function onSubmit(): void {
    setError(null);
    startTransition(async () => {
      const result = await adminCreateGiftCardAction(locale, {
        amount: Number(amount),
        recipientName,
        recipientEmail,
        recipientPhone: recipientPhone || undefined,
        purchaserName,
        message: message || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        paymentMethod,
        sendEmail,
        activateImmediately: true,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={copy.drawer.newAria}
      panelClassName="w-full max-w-md"
    >
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {copy.drawer.newTitle}
        </h2>
      </div>
      <div className="space-y-4 px-5 py-4">
        <label className="block space-y-1">
          <span className={ADMIN_LABEL}>{copy.drawer.amount}</span>
          <input
            className={ADMIN_INPUT}
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <fieldset className="space-y-2">
          <legend className={ADMIN_LABEL}>{copy.drawer.paymentMethod}</legend>
          <div className="space-y-2">
            {paymentOptions.map((option) => (
              <CheckoutPaymentMethodOption
                key={option.id}
                option={option}
                selected={paymentMethod === option.id}
                disabled={isPending}
                cardDescriptionBelowIcons={option.id === "arca"}
                onSelect={(method) =>
                  setPaymentMethod(method as GiftCardPaymentMethod)
                }
              />
            ))}
          </div>
        </fieldset>
        <label className="block space-y-1">
          <span className={ADMIN_LABEL}>{copy.drawer.recipientName}</span>
          <input
            className={ADMIN_INPUT}
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className={ADMIN_LABEL}>{copy.drawer.recipientEmail}</span>
          <input
            className={ADMIN_INPUT}
            type="email"
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className={ADMIN_LABEL}>{copy.drawer.recipientPhone}</span>
          <input
            className={ADMIN_INPUT}
            value={recipientPhone}
            onChange={(event) => setRecipientPhone(event.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className={ADMIN_LABEL}>{copy.drawer.purchaserName}</span>
          <input
            className={ADMIN_INPUT}
            value={purchaserName}
            onChange={(event) => setPurchaserName(event.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className={ADMIN_LABEL}>{copy.drawer.message}</span>
          <textarea
            className={ADMIN_INPUT}
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className={ADMIN_LABEL}>{copy.drawer.expiresOptional}</span>
          <AdminDateTimePickerField
            value={expiresAt}
            onChange={setExpiresAt}
            locale={locale}
            common={copy.common}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(event) => setSendEmail(event.target.checked)}
          />
          {copy.drawer.sendEmail}
        </label>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {copy.common.cancel}
          </Button>
          <Button type="button" disabled={isPending} onClick={onSubmit}>
            {isPending ? copy.common.creating : copy.common.create}
          </Button>
        </div>
      </div>
    </SideSheet>
  );
}
