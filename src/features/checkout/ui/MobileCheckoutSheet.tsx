"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { loadCheckoutFormViewAction } from "@/features/checkout/application/load-checkout-form-view-action";
import type { CheckoutFormView } from "@/features/checkout/application/get-checkout-form-view";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import { checkoutFormLabels } from "@/features/checkout/ui/checkout-form-labels";
import { CHECKOUT_SHEET_TEXTURE } from "@/features/checkout/ui/checkout-sheet-surface";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type MobileCheckoutSheetProps = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  dictionary: Dictionary;
};

/**
 * Mobile checkout overlay opened from the cart. Desktop still uses /checkout.
 */
export function MobileCheckoutSheet({
  open,
  onClose,
  locale,
  dictionary,
}: MobileCheckoutSheetProps) {
  const router = useRouter();
  const [view, setView] = useState<CheckoutFormView | null>(null);
  const labels = checkoutFormLabels(dictionary.checkout);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    void loadCheckoutFormViewAction(locale).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        onCloseRef.current();
        router.push(result.redirectTo);
        return;
      }
      setView(result.view);
    });

    return () => {
      cancelled = true;
    };
  }, [open, locale, router]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel={labels.title}
      panelClassName="bg-brand-forest text-white"
      panelStyle={CHECKOUT_SHEET_TEXTURE}
    >
      {view ? (
        <CheckoutForm
          key={`${view.orderProducts.map((item) => item.id).join("-")}-${view.subtotalAmount}`}
          variant="sheet"
          locale={locale}
          labels={labels}
          productsHref={view.productsHref}
          hasItems={view.hasItems}
          orderProducts={view.orderProducts}
          defaultFirstName={view.defaultFirstName}
          defaultLastName={view.defaultLastName}
          defaultEmail={view.defaultEmail}
          defaultPhone={view.defaultPhone}
          defaultLine1={view.defaultLine1}
          subtotalAmount={view.subtotalAmount}
          deliverySchedule={view.deliverySchedule}
          cashChangeOptions={view.cashChangeOptions}
          splitOthersPrepaid={view.splitOthersPrepaid}
          othersPrepaidAmount={view.othersPrepaidAmount}
          lockedDeliveryAmount={view.lockedDeliveryAmount}
          bonusAvailableBalance={view.bonusAvailableBalance}
          bonusMaxRedeemPercent={view.bonusMaxRedeemPercent}
          bonusAccrualPercent={view.bonusAccrualPercent}
          onOrderPlaced={onClose}
        />
      ) : (
        <div className="space-y-3 px-5 pt-4">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-white/15" />
          <div className="h-28 animate-pulse rounded-[20px] bg-white/10" />
          <div className="h-28 animate-pulse rounded-[20px] bg-white/10" />
        </div>
      )}
    </BottomSheet>
  );
}
