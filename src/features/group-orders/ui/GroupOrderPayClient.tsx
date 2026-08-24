"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import type { CheckoutOnlineProvider } from "@/features/checkout/domain/payment-methods";
import {
  CheckoutPaymentMethodOption,
  type CheckoutPaymentOption,
} from "@/features/checkout/ui/CheckoutPaymentMethodOption";
import { completeParticipantCardPaymentAction } from "@/features/group-orders/actions";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

const PAGE_TITLE =
  "font-big-fat-boii text-[58px] leading-[1.1] font-normal tracking-wide text-white uppercase whitespace-nowrap sm:text-[32px]";

const PAGE_SUBTITLE = "mt-2 text-base leading-relaxed text-white/70";

const PILL_FULL = "max-w-none sm:max-w-none";

type CheckoutPaymentLabels = Pick<
  Dictionary["checkout"]["payment"],
  "card" | "cardDescription" | "idram" | "idramDescription"
>;

type GroupOrderPayClientProps = {
  locale: Locale;
  labels: Dictionary["groupOrder"];
  checkoutPaymentLabels: CheckoutPaymentLabels;
  inviteToken: string;
  displayName: string;
  amountFormatted: string;
  alreadyPaid: boolean;
  amount: number;
};

export function GroupOrderPayClient({
  locale,
  labels,
  checkoutPaymentLabels,
  inviteToken,
  displayName,
  amountFormatted,
  alreadyPaid,
  amount,
}: GroupOrderPayClientProps) {
  const router = useRouter();
  const [provider, setProvider] = useState<CheckoutOnlineProvider>("arca");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const backHref = `/${locale}/group-orders/${inviteToken}`;

  const paymentOptions = useMemo<CheckoutPaymentOption[]>(
    () => [
      {
        id: "arca",
        name: checkoutPaymentLabels.card,
        shortName: checkoutPaymentLabels.card,
        description: checkoutPaymentLabels.cardDescription,
      },
      {
        id: "idram",
        name: checkoutPaymentLabels.idram,
        shortName: checkoutPaymentLabels.idram,
        description: checkoutPaymentLabels.idramDescription,
      },
    ],
    [checkoutPaymentLabels],
  );

  if (alreadyPaid || amount <= 0) {
    return (
      <div className="group-order-page mx-auto max-w-lg px-0 py-8">
        <div className="liquid-glass isolate overflow-hidden rounded-3xl p-6 text-center sm:p-8">
          <h1 className={PAGE_TITLE}>
            {labels.payAlreadyPaidTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {labels.payAlreadyPaidHint}
          </p>
          <div className="mt-6 flex justify-center">
            <KamanchaPillButton
              href={backHref}
              label={labels.payBackToGroup}
              className={PILL_FULL}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group-order-page mx-auto max-w-lg px-0 py-8">
      <header className="mb-6">
        <h1 className={PAGE_TITLE}>{labels.payTitle}</h1>
        <p className={PAGE_SUBTITLE}>
          {labels.payDescription.replace("{name}", displayName)}
        </p>
      </header>

      <section className="liquid-glass isolate overflow-hidden rounded-3xl p-5 sm:p-6">
        <p className="font-big-fat-boii text-3xl font-normal tracking-wide text-white tabular-nums sm:text-4xl">
          {amountFormatted}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/60">
          {labels.payAmountHint}
        </p>

        <fieldset className="mt-6">
          <legend className="mb-3 block text-sm font-medium text-white">
            {labels.paySelectProvider}
          </legend>
          <div className="space-y-3">
            {paymentOptions.map((option) => (
              <CheckoutPaymentMethodOption
                key={option.id}
                option={option}
                selected={provider === option.id}
                disabled={pending}
                onSelect={(method) => setProvider(method as CheckoutOnlineProvider)}
              />
            ))}
          </div>
        </fieldset>

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-300/40 bg-red-950/30 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}

        <div className="mt-6">
          <KamanchaPillButton
            type="button"
            variant="light"
            label={pending ? labels.payProcessing : labels.payConfirm}
            className={PILL_FULL}
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await completeParticipantCardPaymentAction({
                  inviteToken,
                  provider,
                });
                if (!result.ok) {
                  setError(result.error ?? labels.errorGeneric);
                  return;
                }
                router.push(backHref);
                router.refresh();
              });
            }}
          />
        </div>

        <AppLink
          href={backHref}
          className="mt-4 block text-center text-sm text-white/70 underline-offset-2 transition-colors hover:text-white hover:underline"
        >
          {labels.payBackToGroup}
        </AppLink>
      </section>
    </div>
  );
}
