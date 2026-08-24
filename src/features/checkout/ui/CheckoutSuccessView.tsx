import { Check } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const PAGE_TITLE =
  "mb-8 text-center font-big-fat-boii text-[40px] leading-[1.1] font-normal tracking-wide text-white uppercase sm:text-[48px] md:text-[58px] md:leading-[1.1]";

const SECONDARY_CTA =
  "relative z-[2] inline-flex h-12 w-full items-center justify-center rounded-[70px] bg-white px-4 font-big-fat-boii text-base leading-none text-brand-forest transition-colors hover:bg-white/95";

type CheckoutSuccessViewProps = {
  locale: Locale;
  orderNumber: string;
  totalFormatted: string;
  showViewOrders: boolean;
  labels: Dictionary["checkout"]["success"];
};

export function CheckoutSuccessView({
  locale,
  orderNumber,
  totalFormatted,
  showViewOrders,
  labels,
}: CheckoutSuccessViewProps) {
  return (
    <div className="checkout-page mx-auto max-w-lg">
      <h1 className={PAGE_TITLE}>{labels.title}</h1>

      <section className="liquid-glass isolate overflow-hidden rounded-3xl px-5 py-8 text-center sm:px-8 sm:py-10">
        <div className="relative z-[2] mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-brand-forest sm:size-20">
          <Check
            className="size-8 text-white sm:size-10"
            strokeWidth={2.5}
            aria-hidden
          />
        </div>

        <p className="relative z-[2] font-big-fat-boii text-2xl font-normal tracking-wide text-white uppercase sm:text-3xl">
          {orderNumber}
        </p>
        <p className="relative z-[2] mt-4 text-sm leading-relaxed text-gray-700 sm:text-base">
          {labels.body.replace("{orderNumber}", orderNumber)}
        </p>

        <div className="relative z-[2] mt-6 border-t border-white/40 pt-4">
          <p className="font-big-fat-boii text-lg font-normal tracking-wide text-white uppercase">
            {labels.total.replace("{amount}", totalFormatted)}
          </p>
        </div>

        <div className="relative z-[2] mt-8 flex flex-col items-center gap-3">
          <KamanchaPillButton
            href={`/${locale}/products`}
            label={labels.continueShopping}
            variant="light"
            className="max-w-none sm:max-w-none"
          />
          {showViewOrders ? (
            <AppLink
              href={`/${locale}/profile/orders`}
              prefetchPolicy="intent"
              className={SECONDARY_CTA}
            >
              {labels.viewOrders}
            </AppLink>
          ) : null}
        </div>
      </section>
    </div>
  );
}
