"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { DateTimePickerField } from "@/components/ui/DateTimePickerField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { formatYerevanDate } from "@/features/delivery/domain/delivery-schedule";
import {
  CheckoutPaymentMethodOption,
  type CheckoutPaymentOption,
} from "@/features/checkout/ui/CheckoutPaymentMethodOption";
import { CHECKOUT_INVALID_FEEDBACK_MS, CHECKOUT_TITLE_INVALID_CLASS } from "@/features/checkout/ui/checkout-ui";
import { purchaseGiftCardAction } from "@/features/gift-cards/application/admin-actions";
import type { GiftCardPaymentMethod } from "@/features/gift-cards/domain/gift-card-payment-method";
import type { GiftCardSettings } from "@/features/gift-cards/domain/gift-card-rules";
import { PROFILE_PILL_DARK } from "@/features/profile/ui/profile-surface";
import type { Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";

/** Solid white sheet fields (drawer is never on forest glass). */
const DRAWER_FIELD =
  "h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 hover:border-gray-300 focus:border-brand-forest/40";

const DRAWER_LABEL =
  "flex flex-col gap-1.5 text-sm font-medium text-gray-900";

const GIFT_CARD_INVALID_FIELDS = [
  "amount",
  "recipientName",
  "recipientEmail",
  "purchaserName",
  "paymentMethod",
] as const;

type GiftCardInvalidField = (typeof GIFT_CARD_INVALID_FIELDS)[number];

type GiftCardInvalidFields = Partial<Record<GiftCardInvalidField, true>>;

function isEmailValid(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function labelClass(invalid: boolean | undefined): string {
  return invalid ? `${DRAWER_LABEL} ${CHECKOUT_TITLE_INVALID_CLASS}` : DRAWER_LABEL;
}

function fieldClass(invalid: boolean | undefined, extra = ""): string {
  return `${DRAWER_FIELD} ${extra} ${
    invalid ? "border-red-500 focus:border-red-500" : ""
  }`;
}

export type GiftCardPaymentLabels = {
  cashOnDelivery: string;
  cashShort: string;
  cashOnDeliveryDescription: string;
  card: string;
  cardDescription: string;
};

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
  payment: GiftCardPaymentLabels;
  submit: string;
  submitting: string;
  successActive: string;
  successPendingPayment: string;
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
    useState<GiftCardPaymentMethod | null>(null);
  const [invalidFields, setInvalidFields] = useState<GiftCardInvalidFields>({});
  const invalidFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const paymentListRef = useRef<HTMLDivElement>(null);
  const [paymentFrame, setPaymentFrame] = useState<{
    top: number;
    height: number;
  } | null>(null);
  const minSendDate = formatYerevanDate(new Date());
  const useCustom = selectedAmount === "custom";

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

  useLayoutEffect(() => {
    const list = paymentListRef.current;
    const selected = list?.querySelector<HTMLElement>("[data-payment-selected='true']");
    if (!list || !selected) {
      setPaymentFrame(null);
      return;
    }
    setPaymentFrame({
      top: selected.offsetTop,
      height: selected.offsetHeight,
    });
  }, [paymentMethod]);

  const resolvedAmount = useMemo(() => {
    if (!useCustom) {
      return Number(selectedAmount);
    }
    const parsed = Number(customAmount);
    return Number.isInteger(parsed) ? parsed : 0;
  }, [selectedAmount, customAmount, useCustom]);

  function clearInvalidField(field: GiftCardInvalidField): void {
    setInvalidFields((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function markInvalid(nextInvalid: GiftCardInvalidFields): void {
    if (invalidFeedbackTimeoutRef.current) {
      clearTimeout(invalidFeedbackTimeoutRef.current);
    }
    setInvalidFields({});
    requestAnimationFrame(() => {
      setInvalidFields(nextInvalid);
      const first = GIFT_CARD_INVALID_FIELDS.find((field) => nextInvalid[field]);
      const target = first
        ? document.querySelector(`[data-gift-card-field="${first}"]`)
        : null;
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable =
          target instanceof HTMLInputElement
            ? target
            : target.querySelector("input, button, [tabindex]:not([tabindex='-1'])");
        if (focusable instanceof HTMLElement) {
          focusable.focus({ preventScroll: true });
        }
      }
      invalidFeedbackTimeoutRef.current = setTimeout(() => {
        setInvalidFields({});
        invalidFeedbackTimeoutRef.current = null;
      }, CHECKOUT_INVALID_FEEDBACK_MS);
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    setSuccess(null);

    const nextInvalid: GiftCardInvalidFields = {};
    if (useCustom && (resolvedAmount < settings.minAmount || resolvedAmount > settings.maxAmount)) {
      nextInvalid.amount = true;
    }
    if (!String(data.get("recipientName") ?? "").trim()) {
      nextInvalid.recipientName = true;
    }
    if (!isEmailValid(String(data.get("recipientEmail") ?? "").trim())) {
      nextInvalid.recipientEmail = true;
    }
    if (!String(data.get("purchaserName") ?? "").trim()) {
      nextInvalid.purchaserName = true;
    }
    if (!paymentMethod) {
      nextInvalid.paymentMethod = true;
    }
    if (GIFT_CARD_INVALID_FIELDS.some((field) => nextInvalid[field])) {
      markInvalid(nextInvalid);
      return;
    }
    if (!paymentMethod) {
      return;
    }

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
        paymentMethod,
      });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setSuccess(
        result.value.status === "ACTIVE"
          ? copy.successActive
          : copy.successPendingPayment,
      );
      router.refresh();
      onSuccess?.();
    });
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <div className={labelClass(invalidFields.amount)} data-gift-card-field="amount">
        <span>{copy.amount}</span>
        <SelectDropdown
          className={useCustom ? undefined : "md:hidden"}
          ariaLabel={copy.amount}
          value={selectedAmount}
          options={amountOptions}
          onValueChange={setSelectedAmount}
          deferChange={false}
          triggerContent={
            useCustom ? (
              <input
                type="number"
                min={settings.minAmount}
                max={settings.maxAmount}
                value={customAmount}
                onChange={(event) => {
                  setCustomAmount(event.target.value);
                  clearInvalidField("amount");
                }}
                className="h-full w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder={copy.customAmount}
                autoFocus
              />
            ) : undefined
          }
        />
        {useCustom ? null : (
          <div className="hidden md:block">
            <SegmentedControl
              aria-label={copy.amount}
              value={selectedAmount}
              options={amountOptions}
              onSelect={setSelectedAmount}
            />
          </div>
        )}
      </div>

      <label className={labelClass(invalidFields.recipientName)}>
        {copy.recipientName}
        <input
          name="recipientName"
          data-gift-card-field="recipientName"
          maxLength={120}
          className={fieldClass(invalidFields.recipientName)}
          onChange={() => clearInvalidField("recipientName")}
        />
      </label>
      <label className={labelClass(invalidFields.recipientEmail)}>
        {copy.recipientEmail}
        <input
          name="recipientEmail"
          data-gift-card-field="recipientEmail"
          type="email"
          maxLength={254}
          className={fieldClass(invalidFields.recipientEmail)}
          onChange={() => clearInvalidField("recipientEmail")}
        />
      </label>
      <label className={DRAWER_LABEL}>
        {copy.recipientPhone}
        <input name="recipientPhone" maxLength={40} className={DRAWER_FIELD} />
      </label>
      <label className={labelClass(invalidFields.purchaserName)}>
        {copy.purchaserName}
        <input
          name="purchaserName"
          data-gift-card-field="purchaserName"
          maxLength={120}
          defaultValue={defaultPurchaserName}
          className={fieldClass(invalidFields.purchaserName)}
          onChange={() => clearInvalidField("purchaserName")}
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
      <fieldset className="space-y-2" data-gift-card-field="paymentMethod">
        <legend
          className={`text-sm font-medium text-gray-900 ${
            invalidFields.paymentMethod ? CHECKOUT_TITLE_INVALID_CLASS : ""
          }`}
        >
          {copy.paymentMethod}
        </legend>
        <div ref={paymentListRef} className="relative min-w-0 space-y-2">
          {paymentFrame ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 z-[3] rounded-[15px] border border-brand-forest transition-[top,height] duration-300 ease-out motion-reduce:transition-none"
              style={{ top: paymentFrame.top, height: paymentFrame.height }}
            />
          ) : null}
          {paymentOptions.map((option) => (
            <div
              key={option.id}
              data-payment-selected={paymentMethod === option.id}
            >
              <CheckoutPaymentMethodOption
                option={option}
                selected={paymentMethod === option.id}
                disabled={pending}
                compact
                persistentBorder
                onSelect={(method) => {
                  clearInvalidField("paymentMethod");
                  setPaymentMethod(method as GiftCardPaymentMethod);
                }}
              />
            </div>
          ))}
        </div>
      </fieldset>

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
