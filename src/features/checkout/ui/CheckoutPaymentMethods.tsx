"use client";

import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import { CashChangePicker } from "@/features/checkout/ui/CashChangePicker";
import {
  CheckoutPaymentMethodOption,
  type CheckoutPaymentOption,
} from "@/features/checkout/ui/CheckoutPaymentMethodOption";
import type { CashChangeSelection } from "@/features/checkout/ui/checkout-cash-change-assets";
import type { CashChangeDenominationView } from "@/features/delivery/domain/cash-change";

type CashChangeLabels = {
  title: string;
  hint: string;
  noneLabel: string;
  dueLabel: string;
};

type CheckoutPaymentMethodsProps = {
  title: string;
  options: CheckoutPaymentOption[];
  value: CheckoutPaymentMethod;
  onChange: (method: CheckoutPaymentMethod) => void;
  disabled: boolean;
  cashChangeOptions: CashChangeDenominationView[];
  cashChangeValue: CashChangeSelection;
  onCashChangeChange: (value: CashChangeSelection) => void;
  cashChangeLabels: CashChangeLabels;
  payableTotal: number;
  cashChangeDueFormatted: string | null;
};

export function CheckoutPaymentMethods({
  title,
  options,
  value,
  onChange,
  disabled,
  cashChangeOptions,
  cashChangeValue,
  onCashChangeChange,
  cashChangeLabels,
  payableTotal,
  cashChangeDueFormatted,
}: CheckoutPaymentMethodsProps) {
  return (
    <section className="rounded-3xl bg-white px-5 py-6 shadow-sm ring-1 ring-gray-200/80 sm:px-6 sm:py-7">
      <h2 className="mb-6 font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
        {title}
      </h2>
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.id} className="space-y-3">
            <CheckoutPaymentMethodOption
              option={option}
              selected={value === option.id}
              disabled={disabled}
              onSelect={onChange}
            />
            {option.id === "cash_on_delivery" &&
            value === "cash_on_delivery" ? (
              <CashChangePicker
                options={cashChangeOptions}
                value={cashChangeValue}
                onChange={onCashChangeChange}
                disabled={disabled}
                payableTotal={payableTotal}
                dueFormatted={cashChangeDueFormatted}
                labels={cashChangeLabels}
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
