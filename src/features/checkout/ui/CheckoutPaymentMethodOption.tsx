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
};

function optionClass(selected: boolean): string {
  return `${CHECKOUT_PAYMENT_OPTION_BASE_CLASS} ${
    selected
      ? CHECKOUT_PAYMENT_OPTION_SELECTED_CLASS
      : CHECKOUT_PAYMENT_OPTION_DEFAULT_CLASS
  }`;
}

export function CheckoutPaymentMethodOption({
  option,
  selected,
  disabled,
  onSelect,
}: CheckoutPaymentMethodOptionProps) {
  const isCardMethod = option.id === "arca";
  const icons = (
    <CheckoutPaymentMethodIcons
      methodId={option.id}
      mobileCardFramed={isCardMethod}
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
          className="self-center"
        />
        <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-1.5 lg:hidden">
          <span className="font-medium text-gray-900">{option.shortName}</span>
          {icons}
        </div>
        <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex lg:gap-4">
          <div className="flex shrink-0 items-center">{icons}</div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900">{option.name}</div>
            <div className="text-sm text-gray-600">{option.description}</div>
          </div>
        </div>
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
      />
      <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
        <div className="flex shrink-0 items-center">{icons}</div>
        <div className="min-w-0">
          {option.id === "cash_on_delivery" ? (
            <>
              <div className="font-medium text-gray-900">{option.name}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </>
          ) : (
            <>
              <span className="font-medium text-gray-900 lg:hidden">
                {option.shortName}
              </span>
              <div className="hidden lg:block">
                <div className="font-medium text-gray-900">{option.name}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </label>
  );
}
