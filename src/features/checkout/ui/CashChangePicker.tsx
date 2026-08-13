"use client";

import Image from "next/image";

import {
  CASH_CHANGE_DENOMINATIONS_AMD,
  CASH_CHANGE_NONE,
  CHECKOUT_CASH_CHANGE_GRID_CLASS,
  CHECKOUT_CASH_CHANGE_HINT_CLASS,
  CHECKOUT_CASH_CHANGE_NONE_CLASS,
  CHECKOUT_CASH_CHANGE_NOTE_BUTTON_CLASS,
  CHECKOUT_CASH_CHANGE_NOTE_IMAGE_CLASS,
  CHECKOUT_CASH_CHANGE_OPTION_BASE_CLASS,
  CHECKOUT_CASH_CHANGE_OPTION_DEFAULT_CLASS,
  CHECKOUT_CASH_CHANGE_OPTION_SELECTED_CLASS,
  CHECKOUT_CASH_CHANGE_SECTION_CLASS,
  CHECKOUT_CASH_CHANGE_TITLE_CLASS,
  resolveCashChangeImageUrl,
  type CashChangeSelection,
} from "@/features/checkout/ui/checkout-cash-change-assets";
import {
  computeCashChangeDue,
  type CashChangeDenominationView,
} from "@/features/delivery/domain/cash-change";

type CashChangePickerLabels = {
  title: string;
  hint: string;
  noneLabel: string;
  dueLabel: string;
};

type CashChangePickerProps = {
  options: CashChangeDenominationView[];
  value: CashChangeSelection;
  onChange: (value: CashChangeSelection) => void;
  disabled?: boolean;
  payableTotal: number;
  dueFormatted: string | null;
  labels: CashChangePickerLabels;
};

function optionClass(selected: boolean): string {
  return `${CHECKOUT_CASH_CHANGE_OPTION_BASE_CLASS} ${
    selected
      ? CHECKOUT_CASH_CHANGE_OPTION_SELECTED_CLASS
      : CHECKOUT_CASH_CHANGE_OPTION_DEFAULT_CLASS
  }`;
}

export function CashChangePicker({
  options,
  value,
  onChange,
  disabled = false,
  payableTotal,
  dueFormatted,
  labels,
}: CashChangePickerProps) {
  const imageByAmount = new Map(
    options.map((option) => [option.amount, option.imageUrl]),
  );

  return (
    <div className={CHECKOUT_CASH_CHANGE_SECTION_CLASS}>
      <h3 className={CHECKOUT_CASH_CHANGE_TITLE_CLASS}>{labels.title}</h3>
      <p className={CHECKOUT_CASH_CHANGE_HINT_CLASS}>{labels.hint}</p>
      <div
        className={CHECKOUT_CASH_CHANGE_GRID_CLASS}
        role="radiogroup"
        aria-label={labels.title}
      >
        <button
          type="button"
          role="radio"
          aria-checked={value === CASH_CHANGE_NONE}
          disabled={disabled}
          className={`${optionClass(value === CASH_CHANGE_NONE)} ${CHECKOUT_CASH_CHANGE_NONE_CLASS}`}
          onClick={() => onChange(CASH_CHANGE_NONE)}
        >
          {labels.noneLabel}
        </button>
        {CASH_CHANGE_DENOMINATIONS_AMD.filter(
          (amount) => computeCashChangeDue(amount, payableTotal) != null,
        ).map((amount) => {
          const selected = value === amount;
          const src = resolveCashChangeImageUrl(
            amount,
            imageByAmount.get(amount) ?? null,
          );

          return (
            <button
              key={amount}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              className={`${optionClass(selected)} ${CHECKOUT_CASH_CHANGE_NOTE_BUTTON_CLASS}`}
              onClick={() => onChange(amount)}
            >
              {src ? (
                <Image
                  src={src}
                  alt={`${amount} AMD`}
                  fill
                  className={CHECKOUT_CASH_CHANGE_NOTE_IMAGE_CLASS}
                  sizes="(max-width: 640px) 33vw, 180px"
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {dueFormatted ? (
        <p className="mt-4 text-sm font-semibold text-brand-forest">
          {labels.dueLabel.replace("{amount}", dueFormatted)}
        </p>
      ) : null}
    </div>
  );
}
