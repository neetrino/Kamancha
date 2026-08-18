"use client";

import Image from "next/image";

import {
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
  const visibleOptions = options.filter(
    (option) => computeCashChangeDue(option.amount, payableTotal) != null,
  );

  return (
    <div className={CHECKOUT_CASH_CHANGE_SECTION_CLASS}>
      <h3 className={`relative z-[2] ${CHECKOUT_CASH_CHANGE_TITLE_CLASS}`}>
        {labels.title}
      </h3>
      <p className={`relative z-[2] ${CHECKOUT_CASH_CHANGE_HINT_CLASS}`}>
        {labels.hint}
      </p>
      <div
        className={`relative z-[2] ${CHECKOUT_CASH_CHANGE_GRID_CLASS}`}
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
          <span className="relative z-[2]">{labels.noneLabel}</span>
        </button>
        {visibleOptions.map((option) => {
          const selected = value === option.amount;
          const src = option.imageUrl || null;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              className={`${optionClass(selected)} ${CHECKOUT_CASH_CHANGE_NOTE_BUTTON_CLASS}`}
              onClick={() => onChange(option.amount)}
            >
              {src ? (
                <Image
                  src={src}
                  alt={`${option.amount} AMD`}
                  fill
                  className={`relative z-[2] ${CHECKOUT_CASH_CHANGE_NOTE_IMAGE_CLASS}`}
                  sizes="(max-width: 640px) 25vw, 140px"
                />
              ) : (
                <span className="relative z-[2] px-1.5 text-center font-big-fat-boii text-[11px] font-normal leading-snug tracking-wide text-brand-forest uppercase sm:text-sm">
                  {option.amount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {dueFormatted ? (
        <p className="relative z-[2] mt-4 text-sm font-semibold text-brand-forest">
          {labels.dueLabel.replace("{amount}", dueFormatted)}
        </p>
      ) : null}
    </div>
  );
}
