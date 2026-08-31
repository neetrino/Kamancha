"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";

import type { CheckoutOrderProduct } from "@/features/checkout/ui/checkout-order-product";
import { previewCouponAction } from "@/features/checkout/application/preview-coupon";
import { createOrderAction } from "@/features/checkout/create-order";
import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import { CheckoutDetailsSections } from "@/features/checkout/ui/CheckoutDetailsSections";
import { CheckoutOrderSummary } from "@/features/checkout/ui/CheckoutOrderSummary";
import { CheckoutProductsInOrder } from "@/features/checkout/ui/CheckoutProductsInOrder";
import { useDistanceDeliveryQuote } from "@/features/checkout/ui/use-distance-delivery-quote";
import {
  calculateMaxRedeemAmount,
  clampBonusRedeemRequest,
} from "@/features/bonuses/domain/bonus-rules";
import { previewGiftCardAction } from "@/features/gift-cards/application/preview-gift-card";
import type { GiftCardRedeemPreview } from "@/features/gift-cards/domain/gift-card-rules";
import type { DeliveryScheduleSettings } from "@/features/delivery/domain/delivery-schedule";
import type { SelectedDeliverySlot } from "@/features/delivery/domain/delivery-schedule";
import {
  CASH_CHANGE_NONE,
  type CashChangeSelection,
} from "@/features/checkout/ui/checkout-cash-change-assets";
import { createClientId } from "@/lib/id";
import {
  computeCashChangeDue,
  type CashChangeDenominationView,
} from "@/features/delivery/domain/cash-change";
import type { Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";

const CHECKOUT_PAGE_TITLE =
  "mb-8 font-big-fat-boii text-[40px] leading-[1.1] font-normal tracking-wide text-white uppercase sm:text-[48px] md:text-[58px] md:leading-[1.1]";

type CheckoutLabels = {
  title: string;
  productsInOrder: string;
  itemsOne: string;
  itemsMany: string;
  removeItem: string;
  contactInformation: string;
  shippingAddress: string;
  paymentMethod: string;
  orderSummary: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  floor: string;
  intercomCode: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  floorPlaceholder: string;
  intercomCodePlaceholder: string;
  openMap: string;
  mapTitle: string;
  mapHint: string;
  mapConfirm: string;
  mapCancel: string;
  mapResolving: string;
  enterDeliveryAddress: string;
  calculatingDelivery: string;
  scheduleTitle: string;
  schedulePickTime: string;
  scheduleNoSlots: string;
  schedulePrevMonth: string;
  scheduleNextMonth: string;
  selectDeliverySlot: string;
  cashChangeTitle: string;
  cashChangeHint: string;
  cashChangeNone: string;
  cashChangeDue: string;
  cashOnDelivery: string;
  cashOnDeliveryDescription: string;
  cashShort: string;
  idram: string;
  idramDescription: string;
  card: string;
  cardDescription: string;
  couponTitle: string;
  couponPlaceholder: string;
  couponApply: string;
  couponApplying: string;
  giftCardTitle: string;
  giftCardPlaceholder: string;
  giftCardApply: string;
  giftCardApplying: string;
  giftCardInitial: string;
  giftCardUsed: string;
  giftCardRemaining: string;
  giftCardPayable: string;
  giftCardApplied: string;
  bonusTitle: string;
  bonusTitleShort: string;
  bonusAvailable: string;
  bonusUse: string;
  bonusAmount: string;
  bonusUseMax: string;
  bonusApplied: string;
  discount: string;
  subtotal: string;
  shipping: string;
  change: string;
  total: string;
  placeOrder: string;
  processing: string;
  continueShopping: string;
  cartEmpty: string;
  groupPrepaidTitle: string;
  groupPrepaidHint: string;
  groupPrepaidOthersPaid: string;
  groupPrepaidYouPay: string;
};

type CheckoutFormProps = {
  locale: Locale;
  labels: CheckoutLabels;
  productsHref: string;
  orderProducts: CheckoutOrderProduct[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultPhone: string;
  defaultLine1: string;
  subtotalAmount: number;
  deliverySchedule: DeliveryScheduleSettings;
  cashChangeOptions: CashChangeDenominationView[];
  hasItems: boolean;
  bonusAvailableBalance?: number | null;
  bonusMaxRedeemPercent?: number;
  splitOthersPrepaid?: boolean;
  othersPrepaidAmount?: number;
  lockedDeliveryAmount?: number | null;
};

export function CheckoutForm({
  locale,
  labels,
  productsHref,
  orderProducts,
  defaultFirstName,
  defaultLastName,
  defaultEmail,
  defaultPhone,
  defaultLine1,
  subtotalAmount,
  deliverySchedule,
  cashChangeOptions,
  hasItems,
  bonusAvailableBalance = null,
  bonusMaxRedeemPercent = 0,
  splitOthersPrepaid = false,
  othersPrepaidAmount = 0,
  lockedDeliveryAmount = null,
}: CheckoutFormProps) {
  const router = useRouter();
  const idempotencyKey = useMemo(() => createClientId(), []);
  const [line1, setLine1] = useState(defaultLine1);
  const [deliverySlot, setDeliverySlot] = useState<SelectedDeliverySlot | null>(
    null,
  );
  const [cashChangeAmount, setCashChangeAmount] =
    useState<CashChangeSelection>(CASH_CHANGE_NONE);
  const deliveryQuote = useDistanceDeliveryQuote(
    lockedDeliveryAmount != null ? "" : line1,
  );
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("cash_on_delivery");
  const [error, setError] = useState<string | null>(null);
  const [couponDraft, setCouponDraft] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(
    null,
  );
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [giftCardDraft, setGiftCardDraft] = useState("");
  const [giftCardPreview, setGiftCardPreview] =
    useState<GiftCardRedeemPreview | null>(null);
  const [giftCardError, setGiftCardError] = useState<string | null>(null);
  const [useBonuses, setUseBonuses] = useState(false);
  const [bonusRedeemAmount, setBonusRedeemAmount] = useState(0);
  const [pending, startTransition] = useTransition();
  const [applyingCoupon, startApplyCoupon] = useTransition();
  const [applyingGiftCard, startApplyGiftCard] = useTransition();

  const paymentOptions = useMemo(
    () => [
      {
        id: "cash_on_delivery" as const,
        name: labels.cashOnDelivery,
        shortName: labels.cashShort,
        description: labels.cashOnDeliveryDescription,
      },
      {
        id: "idram" as const,
        name: labels.idram,
        shortName: labels.idram,
        description: labels.idramDescription,
      },
      {
        id: "arca" as const,
        name: labels.card,
        shortName: labels.card,
        description: labels.cardDescription,
      },
    ],
    [
      labels.card,
      labels.cardDescription,
      labels.cashOnDelivery,
      labels.cashOnDeliveryDescription,
      labels.cashShort,
      labels.idram,
      labels.idramDescription,
    ],
  );

  function formatMoney(amount: number): string {
    return formatMoneyAmount(amount, "AMD", locale);
  }

  const shippingAmount =
    lockedDeliveryAmount ?? deliveryQuote.deliveryAmount;
  const merchandiseAfterDiscount = Math.max(0, subtotalAmount - discountAmount);
  const maxBonusRedeem =
    bonusAvailableBalance == null
      ? 0
      : calculateMaxRedeemAmount({
          eligibleMerchandiseAmount: merchandiseAfterDiscount,
          availableBalance: bonusAvailableBalance,
          maxRedeemPercent: bonusMaxRedeemPercent,
        });
  const appliedBonus = useBonuses
    ? clampBonusRedeemRequest(bonusRedeemAmount, maxBonusRedeem)
    : 0;
  const payableBeforeGiftCard =
    Math.max(0, merchandiseAfterDiscount - appliedBonus) + shippingAmount;
  const giftCardRedeem = giftCardPreview
    ? Math.min(giftCardPreview.redeemAmount, payableBeforeGiftCard)
    : 0;
  const afterGiftCard = Math.max(0, payableBeforeGiftCard - giftCardRedeem);
  const prepaidApplied = splitOthersPrepaid ? othersPrepaidAmount : 0;
  const totalAmount = Math.max(0, afterGiftCard - prepaidApplied);
  const selectedCashChange: CashChangeSelection =
    cashChangeAmount !== CASH_CHANGE_NONE &&
    computeCashChangeDue(cashChangeAmount, totalAmount) != null
      ? cashChangeAmount
      : CASH_CHANGE_NONE;
  const cashChangeDue =
    paymentMethod === "cash_on_delivery" &&
    selectedCashChange !== CASH_CHANGE_NONE
      ? computeCashChangeDue(selectedCashChange, totalAmount)
      : null;
  const cashChangeDueFormatted =
    cashChangeDue != null ? formatMoney(cashChangeDue) : null;

  const shippingDistanceLabel =
    lockedDeliveryAmount == null &&
    !deliveryQuote.pending &&
    deliveryQuote.distanceLabel &&
    !deliveryQuote.error
      ? deliveryQuote.distanceLabel
      : null;

  const shippingFormatted =
    lockedDeliveryAmount != null
      ? formatMoney(lockedDeliveryAmount)
      : deliveryQuote.pending
        ? labels.calculatingDelivery
        : shippingDistanceLabel
          ? formatMoney(shippingAmount)
          : "—";

  function clearAppliedCoupon(): void {
    setAppliedCouponCode(null);
    setDiscountAmount(0);
    setGiftCardPreview(null);
  }

  function clearAppliedGiftCard(): void {
    setGiftCardPreview(null);
  }

  function onCouponDraftChange(value: string): void {
    setCouponDraft(value);
    setCouponError(null);
    if (appliedCouponCode) {
      clearAppliedCoupon();
    }
  }

  function onGiftCardDraftChange(value: string): void {
    setGiftCardDraft(value);
    setGiftCardError(null);
    if (giftCardPreview) {
      clearAppliedGiftCard();
    }
  }

  function onApplyCoupon(): void {
    const code = couponDraft.trim();
    if (!code) {
      return;
    }

    setCouponError(null);
    startApplyCoupon(async () => {
      const result = await previewCouponAction({ couponCode: code });
      if (!result.ok) {
        clearAppliedCoupon();
        setCouponError(result.error);
        return;
      }

      setAppliedCouponCode(result.code);
      setCouponDraft(result.code);
      setDiscountAmount(result.discountAmount);
      setCouponError(null);
      setGiftCardPreview(null);
    });
  }

  function onApplyGiftCard(): void {
    const code = giftCardDraft.trim();
    if (!code) {
      return;
    }

    setGiftCardError(null);
    startApplyGiftCard(async () => {
      const result = await previewGiftCardAction({
        giftCardCode: code,
        couponCode: appliedCouponCode ?? undefined,
        bonusRedeemAmount: useBonuses ? appliedBonus : undefined,
        deliveryAmount: shippingAmount,
      });
      if (!result.ok) {
        clearAppliedGiftCard();
        setGiftCardError(result.error);
        return;
      }

      setGiftCardDraft(result.preview.code);
      setGiftCardPreview(result.preview);
      setGiftCardError(null);
    });
  }

  if (!hasItems) {
    return (
      <div className="checkout-page mx-auto max-w-7xl px-0 py-12">
        <h1 className={CHECKOUT_PAGE_TITLE}>{labels.title}</h1>
        <div className="liquid-glass isolate overflow-hidden rounded-2xl p-6 text-center">
          <p className="relative z-[2] mb-4 text-gray-700">{labels.cartEmpty}</p>
          <Link
            href={productsHref}
            className="relative z-[2] inline-flex h-11 items-center justify-center rounded-xl bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-800"
          >
            {labels.continueShopping}
          </Link>
        </div>
      </div>
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);

    if (
      lockedDeliveryAmount == null &&
      (deliveryQuote.pending ||
        deliveryQuote.error ||
        !deliveryQuote.distanceLabel)
    ) {
      setError(labels.enterDeliveryAddress);
      return;
    }

    if (!deliverySlot) {
      setError(labels.selectDeliverySlot);
      return;
    }

    startTransition(async () => {
      const result = await createOrderAction({
        locale,
        idempotencyKey,
        firstName: String(data.get("firstName") ?? ""),
        lastName: String(data.get("lastName") ?? ""),
        contactEmail: String(data.get("contactEmail") ?? ""),
        contactPhone: String(data.get("contactPhone") ?? ""),
        shippingMethod: "delivery",
        paymentMethod,
        line1,
        floor: String(data.get("floor") ?? ""),
        intercomCode: String(data.get("intercomCode") ?? ""),
        scheduledDeliveryDate: deliverySlot.date,
        scheduledDeliveryStart: deliverySlot.startTime,
        scheduledDeliveryEnd: deliverySlot.endTime,
        cashChangeAmount:
          paymentMethod === "cash_on_delivery" &&
          selectedCashChange !== CASH_CHANGE_NONE
            ? selectedCashChange
            : undefined,
        couponCode: appliedCouponCode ?? undefined,
        bonusRedeemAmount: useBonuses ? appliedBonus : undefined,
        giftCardCode: giftCardPreview?.code,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(`/${locale}/checkout/success/${result.orderNumber}`);
      router.refresh();
    });
  }

  return (
    <div className="checkout-page mx-auto max-w-7xl px-0 py-12">
      <h1 className={CHECKOUT_PAGE_TITLE}>{labels.title}</h1>

      <CheckoutProductsInOrder
        products={orderProducts}
        title={labels.productsInOrder}
        itemsOneLabel={labels.itemsOne}
        itemsManyLabel={labels.itemsMany}
        removeItemLabel={labels.removeItem}
        locale={locale}
        onCartChanged={clearAppliedCoupon}
      />

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
          <CheckoutDetailsSections
            labels={labels}
            locale={locale}
            pending={pending}
            deliverySchedule={deliverySchedule}
            deliverySlot={deliverySlot}
            onDeliverySlotChange={setDeliverySlot}
            cashChangeOptions={cashChangeOptions}
            cashChangeAmount={selectedCashChange}
            onCashChangeAmountChange={setCashChangeAmount}
            payableTotal={totalAmount}
            cashChangeDueFormatted={cashChangeDueFormatted}
            line1={line1}
            onLine1Change={setLine1}
            deliveryQuotePending={
              lockedDeliveryAmount != null ? false : deliveryQuote.pending
            }
            deliveryQuoteError={
              lockedDeliveryAmount != null ? null : deliveryQuote.error
            }
            addressLocked={lockedDeliveryAmount != null}
            prepaidNotice={
              splitOthersPrepaid
                ? {
                    title: labels.groupPrepaidTitle,
                    lines: [
                      `${labels.groupPrepaidHint} ${labels.groupPrepaidOthersPaid}: ${formatMoney(prepaidApplied)}.`,
                      `${labels.groupPrepaidYouPay}: ${formatMoney(totalAmount)}.`,
                    ],
                  }
                : null
            }
            paymentMethod={paymentMethod}
            onPaymentMethodChange={(method) => {
              setPaymentMethod(method);
              if (method === "cash_on_delivery") {
                setCashChangeAmount(CASH_CHANGE_NONE);
              }
            }}
            paymentOptions={paymentOptions}
            defaultFirstName={defaultFirstName}
            defaultLastName={defaultLastName}
            defaultEmail={defaultEmail}
            defaultPhone={defaultPhone}
          />

          <CheckoutOrderSummary
            title={labels.orderSummary}
            couponTitle={labels.couponTitle}
            couponPlaceholder={labels.couponPlaceholder}
            couponApplyLabel={labels.couponApply}
            couponApplyingLabel={labels.couponApplying}
            giftCardTitle={labels.giftCardTitle}
            giftCardPlaceholder={labels.giftCardPlaceholder}
            giftCardApplyLabel={labels.giftCardApply}
            giftCardApplyingLabel={labels.giftCardApplying}
            giftCardInitialLabel={labels.giftCardInitial}
            giftCardUsedLabel={labels.giftCardUsed}
            giftCardRemainingLabel={labels.giftCardRemaining}
            giftCardPayableLabel={labels.giftCardPayable}
            giftCardAppliedLabel={labels.giftCardApplied}
            bonusAppliedLabel={labels.bonusApplied}
            discountLabel={labels.discount}
            subtotalLabel={labels.subtotal}
            shippingLabel={labels.shipping}
            changeLabel={labels.change}
            totalLabel={labels.total}
            subtotalFormatted={formatMoney(subtotalAmount)}
            shippingFormatted={shippingFormatted}
            shippingDistanceLabel={shippingDistanceLabel}
            discountFormatted={
              discountAmount > 0 ? formatMoney(discountAmount) : null
            }
            changeFormatted={cashChangeDueFormatted}
            totalFormatted={formatMoney(totalAmount)}
            couponDraft={couponDraft}
            onCouponDraftChange={onCouponDraftChange}
            onApplyCoupon={onApplyCoupon}
            couponError={couponError}
            isApplyingCoupon={applyingCoupon}
            giftCardDraft={giftCardDraft}
            onGiftCardDraftChange={onGiftCardDraftChange}
            onApplyGiftCard={onApplyGiftCard}
            giftCardError={giftCardError}
            isApplyingGiftCard={applyingGiftCard}
            giftCardPreview={
              giftCardPreview
                ? {
                    initialAmount: giftCardPreview.initialAmount,
                    redeemAmount: giftCardRedeem,
                    remainingBalance:
                      giftCardPreview.balanceAmount - giftCardRedeem,
                    payableAfter: afterGiftCard,
                  }
                : null
            }
            bonus={
              bonusAvailableBalance == null
                ? null
                : {
                    availableBalance: bonusAvailableBalance,
                    maxRedeem: maxBonusRedeem,
                    useBonuses,
                    redeemAmount: appliedBonus,
                    onToggle: (enabled) => {
                      setUseBonuses(enabled);
                      setGiftCardPreview(null);
                      if (!enabled) {
                        setBonusRedeemAmount(0);
                      } else if (bonusRedeemAmount <= 0) {
                        setBonusRedeemAmount(maxBonusRedeem);
                      }
                    },
                    onAmountChange: (amount) => {
                      setBonusRedeemAmount(amount);
                      setGiftCardPreview(null);
                    },
                    onUseMax: () => {
                      setBonusRedeemAmount(maxBonusRedeem);
                      setGiftCardPreview(null);
                    },
                    labels: {
                      title: labels.bonusTitle,
                      titleShort: labels.bonusTitleShort,
                      available: labels.bonusAvailable,
                      useBonuses: labels.bonusUse,
                      amount: labels.bonusAmount,
                      useMax: labels.bonusUseMax,
                    },
                    formatMoney,
                  }
            }
            formatMoney={formatMoney}
            error={error}
            isSubmitting={pending}
            placeOrderLabel={labels.placeOrder}
            processingLabel={labels.processing}
          />
        </div>
      </form>
    </div>
  );
}
