"use client";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { LiquidGlassPanel } from "@/components/ui/LiquidGlassPanel";
import {
  CheckoutBonusRedeemField,
  type CheckoutBonusRedeemState,
} from "@/features/checkout/ui/CheckoutBonusRedeemField";
import { CheckoutCodeApplyField } from "@/features/checkout/ui/CheckoutCodeApplyField";
import { useCheckoutSummaryStickyTop } from "@/features/checkout/ui/use-checkout-summary-sticky-top";

const SUMMARY_ALERT_PILL_CLASS =
  "mb-4 w-full rounded-full bg-white px-4 py-3 text-center text-sm font-medium leading-snug text-red-600";

const CHECKOUT_CODE_GLASS_CLASS =
  "relative z-[2] mb-6 liquid-glass isolate overflow-hidden rounded-xl p-4";

type GiftCardPreviewView = {
  initialAmount: number;
  redeemAmount: number;
  remainingBalance: number;
  payableAfter: number;
};

type CheckoutOrderSummaryProps = {
  title: string;
  couponTitle: string;
  couponPlaceholder: string;
  couponApplyLabel: string;
  couponApplyingLabel: string;
  giftCardTitle: string;
  giftCardPlaceholder: string;
  giftCardApplyLabel: string;
  giftCardApplyingLabel: string;
  giftCardInitialLabel: string;
  giftCardUsedLabel: string;
  giftCardRemainingLabel: string;
  giftCardPayableLabel: string;
  giftCardAppliedLabel: string;
  bonusAppliedLabel: string;
  bonusEarnLabel: string | null;
  bonusEarnAmount: number | null;
  discountLabel: string;
  subtotalLabel: string;
  shippingLabel: string;
  changeLabel: string;
  totalLabel: string;
  subtotalFormatted: string;
  shippingFormatted: string;
  /** Distance part shown smaller next to the shipping amount, e.g. "0.6 km". */
  shippingDistanceLabel?: string | null;
  discountFormatted: string | null;
  changeFormatted: string | null;
  totalFormatted: string;
  couponDraft: string;
  onCouponDraftChange: (value: string) => void;
  onApplyCoupon: () => void;
  couponError: string | null;
  isApplyingCoupon: boolean;
  giftCardDraft: string;
  onGiftCardDraftChange: (value: string) => void;
  onApplyGiftCard: () => void;
  giftCardError: string | null;
  isApplyingGiftCard: boolean;
  giftCardPreview: GiftCardPreviewView | null;
  bonus: CheckoutBonusRedeemState | null;
  formatMoney: (amount: number) => string;
  error: string | null;
  isSubmitting: boolean;
  placeOrderLabel: string;
  processingLabel: string;
};

export function CheckoutOrderSummary({
  title,
  couponTitle,
  couponPlaceholder,
  couponApplyLabel,
  couponApplyingLabel,
  giftCardTitle,
  giftCardPlaceholder,
  giftCardApplyLabel,
  giftCardApplyingLabel,
  giftCardInitialLabel,
  giftCardUsedLabel,
  giftCardRemainingLabel,
  giftCardPayableLabel,
  giftCardAppliedLabel,
  bonusAppliedLabel,
  bonusEarnLabel,
  bonusEarnAmount,
  discountLabel,
  subtotalLabel,
  shippingLabel,
  changeLabel,
  totalLabel,
  subtotalFormatted,
  shippingFormatted,
  shippingDistanceLabel = null,
  discountFormatted,
  changeFormatted,
  totalFormatted,
  couponDraft,
  onCouponDraftChange,
  onApplyCoupon,
  couponError,
  isApplyingCoupon,
  giftCardDraft,
  onGiftCardDraftChange,
  onApplyGiftCard,
  giftCardError,
  isApplyingGiftCard,
  giftCardPreview,
  bonus,
  formatMoney,
  error,
  isSubmitting,
  placeOrderLabel,
  processingLabel,
}: CheckoutOrderSummaryProps) {
  const stickyTop = useCheckoutSummaryStickyTop();

  return (
    <div className="lg:sticky xl:self-start" style={{ top: stickyTop }}>
      <LiquidGlassPanel className="px-5 py-6 sm:px-6 sm:py-7">
        <h2 className="relative z-[2] mb-6 font-big-fat-boii text-xl font-normal tracking-wide text-white uppercase">
          {title}
        </h2>

        <div className={CHECKOUT_CODE_GLASS_CLASS}>
          <CheckoutCodeApplyField
            title={couponTitle}
            name="couponCodeDraft"
            draft={couponDraft}
            onDraftChange={onCouponDraftChange}
            onApply={onApplyCoupon}
            placeholder={couponPlaceholder}
            applyLabel={couponApplyLabel}
            applyingLabel={couponApplyingLabel}
            error={couponError}
            isApplying={isApplyingCoupon}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className={CHECKOUT_CODE_GLASS_CLASS}>
          <CheckoutCodeApplyField
            title={giftCardTitle}
            name="giftCardCodeDraft"
            draft={giftCardDraft}
            onDraftChange={onGiftCardDraftChange}
            onApply={onApplyGiftCard}
            placeholder={giftCardPlaceholder}
            applyLabel={giftCardApplyLabel}
            applyingLabel={giftCardApplyingLabel}
            error={giftCardError}
            isApplying={isApplyingGiftCard}
            isSubmitting={isSubmitting}
          >
            {giftCardPreview ? (
              <div className="relative z-[2] mt-3 space-y-1 text-sm text-gray-900 xl:text-white/80">
                <PreviewRow
                  label={giftCardInitialLabel}
                  value={formatMoney(giftCardPreview.initialAmount)}
                />
                <PreviewRow
                  label={giftCardUsedLabel}
                  value={formatMoney(giftCardPreview.redeemAmount)}
                />
                <PreviewRow
                  label={giftCardRemainingLabel}
                  value={formatMoney(giftCardPreview.remainingBalance)}
                />
                <PreviewRow
                  label={giftCardPayableLabel}
                  value={formatMoney(giftCardPreview.payableAfter)}
                />
              </div>
            ) : null}
          </CheckoutCodeApplyField>
        </div>

        {bonus ? (
          <div className={CHECKOUT_CODE_GLASS_CLASS}>
            <CheckoutBonusRedeemField bonus={bonus} isSubmitting={isSubmitting} />
          </div>
        ) : null}

        <div className="relative z-[2] mb-6 space-y-4">
          <div className="flex justify-between text-white">
            <span>{subtotalLabel}</span>
            <span>{subtotalFormatted}</span>
          </div>
          {discountFormatted ? (
            <div className="flex justify-between text-white">
              <span>{discountLabel}</span>
              <span className="text-emerald-200">-{discountFormatted}</span>
            </div>
          ) : null}
          {bonus?.useBonuses && bonus.redeemAmount > 0 ? (
            <div className="flex justify-between text-white">
              <span>{bonusAppliedLabel}</span>
              <span className="text-emerald-200">
                -{formatMoney(bonus.redeemAmount)}
              </span>
            </div>
          ) : null}
          {giftCardPreview && giftCardPreview.redeemAmount > 0 ? (
            <div className="flex justify-between text-white">
              <span>{giftCardAppliedLabel}</span>
              <span className="text-emerald-200">
                -{formatMoney(giftCardPreview.redeemAmount)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between text-white">
            <span>{shippingLabel}</span>
            <span className="text-right">
              {shippingFormatted}
              {shippingDistanceLabel ? (
                <span className="text-[calc(1em-2px)]">
                  {" "}
                  ({shippingDistanceLabel})
                </span>
              ) : null}
            </span>
          </div>
          {changeFormatted ? (
            <div className="flex justify-between text-white">
              <span>{changeLabel}</span>
              <span>{changeFormatted}</span>
            </div>
          ) : null}
          {bonusEarnLabel != null && bonusEarnAmount != null && bonusEarnAmount > 0 ? (
            <div className="flex justify-between font-semibold text-[#f3e5a8]">
              <span>{bonusEarnLabel}</span>
              <span>+{bonusEarnAmount}</span>
            </div>
          ) : null}
          <div className="border-t border-white/40 pt-4">
            <div className="flex justify-between text-lg font-bold text-white">
              <span>{totalLabel}</span>
              <span>{totalFormatted}</span>
            </div>
          </div>
        </div>

        <div className="relative z-[2]">
          {error ? (
            <p className={SUMMARY_ALERT_PILL_CLASS} role="alert">
              {error}
            </p>
          ) : null}

          <KamanchaPillButton
            type="submit"
            variant="light"
            label={isSubmitting ? processingLabel : placeOrderLabel}
            disabled={isSubmitting}
            className="max-w-none sm:max-w-none"
          />
        </div>
      </LiquidGlassPanel>
    </div>
  );
}

function PreviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
