"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { LiquidGlassPanel } from "@/components/ui/LiquidGlassPanel";

const SUMMARY_HEADER_GAP_PX = 16;
const SUMMARY_FALLBACK_TOP_PX = 140;
const SUMMARY_ALERT_PILL_CLASS =
  "mb-4 w-full rounded-full bg-white px-4 py-3 text-center text-sm font-medium leading-snug text-red-600";

const CHECKOUT_COUPON_GLASS_CLASS =
  "relative z-[2] mb-6 liquid-glass isolate overflow-hidden rounded-xl p-4";

const CHECKOUT_COUPON_INPUT_MOBILE_CLASS =
  "h-11 w-full rounded-[15px] border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50";

const CHECKOUT_COUPON_APPLY_MOBILE_CLASS =
  "h-9 shrink-0 rounded-[15px] border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

function useSummaryStickyTop(): number {
  const [top, setTop] = useState(SUMMARY_FALLBACK_TOP_PX);

  useEffect(() => {
    function update(): void {
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      if (!header) {
        setTop(SUMMARY_FALLBACK_TOP_PX);
        return;
      }
      setTop(
        Math.round(header.getBoundingClientRect().bottom + SUMMARY_HEADER_GAP_PX),
      );
    }

    update();
    window.addEventListener("resize", update);
    const header = document.querySelector("[data-site-header]");
    const observer = header ? new ResizeObserver(update) : null;
    if (header && observer) observer.observe(header);

    return () => {
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  return top;
}

type CheckoutOrderSummaryProps = {
  title: string;
  couponTitle: string;
  couponPlaceholder: string;
  couponApplyLabel: string;
  couponApplyingLabel: string;
  discountLabel: string;
  subtotalLabel: string;
  shippingLabel: string;
  changeLabel: string;
  totalLabel: string;
  subtotalFormatted: string;
  shippingFormatted: string;
  shippingAddressPrompt: string | null;
  discountFormatted: string | null;
  changeFormatted: string | null;
  totalFormatted: string;
  couponDraft: string;
  onCouponDraftChange: (value: string) => void;
  onApplyCoupon: () => void;
  couponError: string | null;
  isApplyingCoupon: boolean;
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
  discountLabel,
  subtotalLabel,
  shippingLabel,
  changeLabel,
  totalLabel,
  subtotalFormatted,
  shippingFormatted,
  shippingAddressPrompt,
  discountFormatted,
  changeFormatted,
  totalFormatted,
  couponDraft,
  onCouponDraftChange,
  onApplyCoupon,
  couponError,
  isApplyingCoupon,
  error,
  isSubmitting,
  placeOrderLabel,
  processingLabel,
}: CheckoutOrderSummaryProps) {
  const stickyTop = useSummaryStickyTop();

  return (
    <div className="lg:sticky xl:self-start" style={{ top: stickyTop }}>
      <LiquidGlassPanel className="px-5 py-6 sm:px-6 sm:py-7">
        <h2 className="relative z-[2] mb-6 font-big-fat-boii text-xl font-normal tracking-wide text-white uppercase">
          {title}
        </h2>

        <div className={CHECKOUT_COUPON_GLASS_CLASS}>
          <div className="relative z-[2] xl:hidden">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm text-white/80">{couponTitle}</p>
              <Button
                type="button"
                variant="secondary"
                size="md"
                className={CHECKOUT_COUPON_APPLY_MOBILE_CLASS}
                disabled={isSubmitting || isApplyingCoupon || !couponDraft.trim()}
                onClick={onApplyCoupon}
              >
                {isApplyingCoupon ? couponApplyingLabel : couponApplyLabel}
              </Button>
            </div>
            <input
              type="text"
              name="couponCodeDraft"
              value={couponDraft}
              onChange={(event) => onCouponDraftChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onApplyCoupon();
                }
              }}
              placeholder={couponPlaceholder}
              autoComplete="off"
              disabled={isSubmitting || isApplyingCoupon}
              className={CHECKOUT_COUPON_INPUT_MOBILE_CLASS}
            />
          </div>

          <div className="relative z-[2] hidden xl:block">
            <p className="mb-3 text-sm text-white/80">{couponTitle}</p>
            <div className="flex gap-2">
              <input
                type="text"
                name="couponCodeDraft"
                value={couponDraft}
                onChange={(event) => onCouponDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    onApplyCoupon();
                  }
                }}
                placeholder={couponPlaceholder}
                autoComplete="off"
                disabled={isSubmitting || isApplyingCoupon}
                className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="h-11 shrink-0 rounded-lg border-gray-200 bg-white px-4 text-sm text-gray-900 hover:bg-gray-50"
                disabled={isSubmitting || isApplyingCoupon || !couponDraft.trim()}
                onClick={onApplyCoupon}
              >
                {isApplyingCoupon ? couponApplyingLabel : couponApplyLabel}
              </Button>
            </div>
          </div>

          {couponError ? (
            <p className={`${SUMMARY_ALERT_PILL_CLASS} relative z-[2] mt-2`} role="alert">
              {couponError}
            </p>
          ) : null}
        </div>

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
          <div className="flex justify-between text-white">
            <span>{shippingLabel}</span>
            <span className="text-right">{shippingFormatted}</span>
          </div>
          {changeFormatted ? (
            <div className="flex justify-between text-white">
              <span>{changeLabel}</span>
              <span>{changeFormatted}</span>
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
          {shippingAddressPrompt ? (
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("checkout-shipping-address")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={SUMMARY_ALERT_PILL_CLASS}
            >
              {shippingAddressPrompt}
            </button>
          ) : null}
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
