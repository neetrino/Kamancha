"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { DateTimePickerField } from "@/components/ui/DateTimePickerField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { formatYerevanDate } from "@/features/delivery/domain/delivery-schedule";
import { purchaseGiftCardAction } from "@/features/gift-cards/application/admin-actions";
import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import type { GiftCardSettings } from "@/features/gift-cards/domain/gift-card-rules";
import { PROFILE_PILL_DARK } from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";

/** Solid white sheet fields (drawer is never on forest glass). */
const DRAWER_FIELD =
  "h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-brand-forest/40";

const DRAWER_LABEL =
  "flex flex-col gap-1.5 text-sm font-medium text-gray-900";

type BuyGiftCardFormCopy = {
  title: string;
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

type BuyGiftCardFormProps = {
  locale: Locale;
  settings: GiftCardSettings;
  defaultPurchaserName: string;
  copy: BuyGiftCardFormCopy;
  /** Called after a successful purchase (e.g. close drawer). */
  onSuccess?: () => void;
};

export function BuyGiftCardForm({
  locale,
  settings,
  defaultPurchaserName,
  copy,
  onSuccess,
}: BuyGiftCardFormProps) {
  const router = useRouter();
  const defaultPreset = String(settings.presets[0] ?? settings.minAmount);
  const [selectedAmount, setSelectedAmount] = useState(defaultPreset);
  const [customAmount, setCustomAmount] = useState("");
  const [scheduledSendAt, setScheduledSendAt] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("cash_on_delivery");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const minSendDate = formatYerevanDate(new Date());
  const useCustom = selectedAmount === "custom";

  const amountOptions = useMemo(
    () => [
      ...settings.presets.map((preset) => ({
        value: String(preset),
        label: formatMoneyAmount(preset, "AMD", locale),
      })),
      { value: "custom", label: copy.customAmount },
    ],
    [settings.presets, locale, copy.customAmount],
  );

  const resolvedAmount = useMemo(() => {
    if (!useCustom) {
      return Number(selectedAmount);
    }
    const parsed = Number(customAmount);
    return Number.isInteger(parsed) ? parsed : 0;
  }, [selectedAmount, customAmount, useCustom]);

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await purchaseGiftCardAction({
        locale,
        amount: resolvedAmount,
        recipientName: String(data.get("recipientName") ?? ""),
        recipientEmail: String(data.get("recipientEmail") ?? ""),
        recipientPhone: String(data.get("recipientPhone") ?? "") || undefined,
        purchaserName: String(data.get("purchaserName") ?? ""),
        message: String(data.get("message") ?? "") || undefined,
        scheduledSendAt: String(data.get("scheduledSendAt") ?? "")
          ? new Date(String(data.get("scheduledSendAt"))).toISOString()
          : null,
        paymentMethod: String(
          data.get("paymentMethod") ?? "cash_on_delivery",
        ) as CheckoutPaymentMethod,
      });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setSuccess(copy.successPending);
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className={DRAWER_LABEL}>
        <span>{copy.amount}</span>
        <SegmentedControl
          aria-label={copy.amount}
          value={selectedAmount}
          options={amountOptions}
          onSelect={setSelectedAmount}
        />
        {useCustom ? (
          <input
            type="number"
            min={settings.minAmount}
            max={settings.maxAmount}
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            className={DRAWER_FIELD}
            required
          />
        ) : null}
      </div>

      <label className={DRAWER_LABEL}>
        {copy.recipientName}
        <input
          name="recipientName"
          required
          maxLength={120}
          className={DRAWER_FIELD}
        />
      </label>
      <label className={DRAWER_LABEL}>
        {copy.recipientEmail}
        <input
          name="recipientEmail"
          type="email"
          required
          maxLength={254}
          className={DRAWER_FIELD}
        />
      </label>
      <label className={DRAWER_LABEL}>
        {copy.recipientPhone}
        <input name="recipientPhone" maxLength={40} className={DRAWER_FIELD} />
      </label>
      <label className={DRAWER_LABEL}>
        {copy.purchaserName}
        <input
          name="purchaserName"
          required
          maxLength={120}
          defaultValue={defaultPurchaserName}
          className={DRAWER_FIELD}
        />
      </label>
      <label className={DRAWER_LABEL}>
        {copy.message}
        <textarea
          name="message"
          maxLength={1000}
          rows={3}
          className={`${DRAWER_FIELD} h-auto min-h-[5.5rem] py-3`}
        />
      </label>
      <label className={DRAWER_LABEL}>
        {copy.sendDate}
        <DateTimePickerField
          name="scheduledSendAt"
          value={scheduledSendAt}
          onChange={setScheduledSendAt}
          locale={locale}
          minDate={minSendDate}
          labels={{
            placeholder: copy.datePicker.dateTimePlaceholder,
            clear: copy.datePicker.clear,
            today: copy.datePicker.today,
            weekdays: copy.datePicker.weekdaysShort,
            time: copy.datePicker.time,
          }}
        />
      </label>
      <div className={DRAWER_LABEL}>
        <span>{copy.paymentMethod}</span>
        <SelectDropdown
          name="paymentMethod"
          ariaLabel={copy.paymentMethod}
          value={paymentMethod}
          options={[{ label: copy.cashOnDelivery, value: "cash_on_delivery" }]}
          onValueChange={(value) =>
            setPaymentMethod(value as CheckoutPaymentMethod)
          }
          deferChange={false}
        />
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-brand-forest" role="status">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={`${PROFILE_PILL_DARK} w-full`}
      >
        {pending ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
