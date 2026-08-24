"use client";

import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import { CheckoutPaymentMethodIcons } from "@/features/checkout/ui/CheckoutPaymentMethodIcons";
import { CheckoutRadio } from "@/features/checkout/ui/CheckoutRadio";
import {
  CHECKOUT_PAYMENT_OPTION_BASE_CLASS,
  CHECKOUT_PAYMENT_OPTION_DEFAULT_CLASS,
  CHECKOUT_PAYMENT_OPTION_SELECTED_CLASS,
} from "@/features/checkout/ui/checkout-payment-assets";

export type CheckoutPaymentOption = {
  id: CheckoutPaymentMethod;
  name: string;
  shortName: string;
  description: string;
};

type CheckoutPaymentMethodOptionProps = {
  option: CheckoutPaymentOption;
  selected: boolean;
  disabled: boolean;
  onSelect: (method: CheckoutPaymentMethod) => void;
  cardBadgeSize?: "mobile" | "desktop";
  /** Stack card description under payment icons (group-order pay). */
  cardDescriptionBelowIcons?: boolean;
};

function optionClass(selected: boolean): string {
  return `${CHECKOUT_PAYMENT_OPTION_BASE_CLASS} ${
    selected
      ? CHECKOUT_PAYMENT_OPTION_SELECTED_CLASS
      : CHECKOUT_PAYMENT_OPTION_DEFAULT_CLASS
  }`;
}

function descriptionClass(selected: boolean): string {
  return selected ? "text-sm text-gray-800" : "text-sm text-gray-600";
}

export function CheckoutPaymentMethodOption({
  option,
  selected,
  disabled,
  onSelect,
  cardBadgeSize = "mobile",
  cardDescriptionBelowIcons = false,
}: CheckoutPaymentMethodOptionProps) {
  const isCardMethod = option.id === "arca";
  const useExpandedCardLayout = isCardMethod && cardBadgeSize === "desktop";
  const useStackedCardDescription =
    isCardMethod && cardDescriptionBelowIcons;
  const icons = (
    <CheckoutPaymentMethodIcons
      methodId={option.id}
      mobileCardFramed={isCardMethod}
      cardBadgeSize={cardBadgeSize}
    />
  );

  if (isCardMethod) {
    return (
      <label className={optionClass(selected)}>
        <CheckoutRadio
          name="paymentMethod"
          value={option.id}
          checked={selected}
          onChange={() => onSelect(option.id)}
          disabled={disabled}
          className="relative z-[2] self-center"
        />
        {useStackedCardDescription ? (
          <div className="relative z-[2] flex w-full min-w-0 flex-1 flex-col items-start gap-1.5">
            <span className="font-medium text-gray-900">{option.shortName}</span>
            {icons}
            <div className={`hidden xl:block ${descriptionClass(selected)}`}>
              {option.description}
            </div>
          </div>
        ) : useExpandedCardLayout ? (
          <div className="relative z-[2] flex w-full min-w-0 flex-1 flex-col items-start gap-2">
            <span className="font-medium text-gray-900">{option.shortName}</span>
            {icons}
          </div>
        ) : (
          <>
            <div className="relative z-[2] flex w-full min-w-0 flex-1 flex-col items-start gap-1.5 xl:hidden">
              <span className="font-medium text-gray-900">{option.shortName}</span>
              {icons}
            </div>
            <div className="relative z-[2] hidden min-w-0 flex-1 items-center gap-3 xl:flex xl:gap-4">
              <div className="flex shrink-0 items-center">{icons}</div>
              <div className="min-w-0">
                <div className="font-medium text-gray-900">{option.name}</div>
                <div className={descriptionClass(selected)}>{option.description}</div>
              </div>
            </div>
          </>
        )}
      </label>
    );
  }

  return (
    <label className={optionClass(selected)}>
      <CheckoutRadio
        name="paymentMethod"
        value={option.id}
        checked={selected}
        onChange={() => onSelect(option.id)}
        disabled={disabled}
        className="relative z-[2]"
      />
      <div className="relative z-[2] flex min-w-0 flex-1 items-center gap-3 xl:gap-4">
        <div className="flex shrink-0 items-center">{icons}</div>
        <div className="min-w-0">
          {option.id === "cash_on_delivery" ? (
            <>
              <div className="font-medium text-gray-900">{option.name}</div>
              <div className={`hidden xl:block ${descriptionClass(selected)}`}>
                {option.description}
              </div>
            </>
          ) : (
            <>
              <span className="font-medium text-gray-900 xl:hidden">
                {option.shortName}
              </span>
              <div className="hidden xl:block">
                <div className="font-medium text-gray-900">{option.name}</div>
                <div className={descriptionClass(selected)}>
                  {option.description}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </label>
  );
}
