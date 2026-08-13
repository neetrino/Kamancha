"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";

const SUMMARY_HEADER_GAP_PX = 16;
const SUMMARY_FALLBACK_TOP_PX = 140;

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
    <div className="lg:sticky lg:self-start" style={{ top: stickyTop }}>
      <section className="rounded-3xl bg-white px-5 py-6 shadow-sm ring-1 ring-gray-200/80 sm:px-6 sm:py-7">
        <h2 className="mb-6 font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
          {title}
        </h2>

        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          <p className="mb-3 text-sm text-gray-700">{couponTitle}</p>
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
              className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="h-11 shrink-0 rounded-lg px-4 text-sm"
              disabled={isSubmitting || isApplyingCoupon || !couponDraft.trim()}
              onClick={onApplyCoupon}
            >
              {isApplyingCoupon ? couponApplyingLabel : couponApplyLabel}
            </Button>
          </div>
          {couponError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {couponError}
            </p>
          ) : null}
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex justify-between text-gray-600">
            <span>{subtotalLabel}</span>
            <span>{subtotalFormatted}</span>
          </div>
          {discountFormatted ? (
            <div className="flex justify-between text-gray-600">
              <span>{discountLabel}</span>
              <span className="text-emerald-700">-{discountFormatted}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-gray-600">
            <span>{shippingLabel}</span>
            <span className="text-right">{shippingFormatted}</span>
          </div>
          {changeFormatted ? (
            <div className="flex justify-between text-gray-600">
              <span>{changeLabel}</span>
              <span>{changeFormatted}</span>
            </div>
          ) : null}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>{totalLabel}</span>
              <span>{totalFormatted}</span>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : null}

        <KamanchaPillButton
          type="submit"
          variant="dark"
          label={isSubmitting ? processingLabel : placeOrderLabel}
          disabled={isSubmitting}
          className="max-w-none sm:max-w-none"
        />
      </section>
    </div>
  );
}
