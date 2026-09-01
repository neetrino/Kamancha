"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";

import { IconDropdown } from "@/components/ui/IconDropdown";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { setCurrencyAction } from "@/features/preferences/set-currency-action";
import type { Currency } from "@/lib/money/currency";
import {
  currencies,
  currencyLabels,
  currencySymbols,
} from "@/lib/money/currency";

type CurrencySwitcherProps = {
  currency: Currency;
  availableCurrencies?: readonly Currency[];
  label: string;
  menuPlacement?: "bottom" | "top";
  /** Inline AMD / USD / RUB control (mobile burger). */
  variant?: "dropdown" | "segmented";
};

export function CurrencySwitcher({
  currency,
  availableCurrencies = currencies,
  label,
  menuPlacement = "bottom",
  variant = "dropdown",
}: CurrencySwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeCurrency, setActiveCurrency] = useState(currency);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setActiveCurrency(currency);
    });
    return () => cancelAnimationFrame(frame);
  }, [currency]);

  if (availableCurrencies.length <= 1) {
    return null;
  }

  if (variant === "segmented") {
    return (
      <SegmentedControl
        aria-label={label}
        value={activeCurrency}
        size="sm"
        fullWidth
        disabled={pending}
        options={availableCurrencies.map((item) => ({
          value: item,
          label: item,
        }))}
        onSelect={(item) => {
          setActiveCurrency(item);
          startTransition(async () => {
            await setCurrencyAction(item);
            router.refresh();
          });
        }}
      />
    );
  }

  return (
    <IconDropdown
      label={`${label}: ${currency}`}
      menuPlacement={menuPlacement}
      trigger={(open) => (
        <span className="inline-flex items-center gap-2 text-gray-800">
          <span className="text-base font-semibold leading-none tabular-nums">
            {currencySymbols[currency]}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </span>
      )}
    >
      {availableCurrencies.map((item) => {
        const selected = item === currency;

        return (
          <button
            key={item}
            type="button"
            role="menuitem"
            disabled={pending}
            aria-current={selected ? "true" : undefined}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-800 transition-colors hover:bg-[#dcecc6] hover:text-brand-forest disabled:opacity-50"
            onClick={() => {
              startTransition(async () => {
                await setCurrencyAction(item);
                router.refresh();
              });
            }}
          >
            <span
              className={
                selected
                  ? "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-900 bg-gray-900 text-white"
                  : "flex h-4 w-4 shrink-0 rounded border border-gray-300 bg-white"
              }
              aria-hidden
            >
              {selected ? (
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                  <path
                    d="M2.5 6.2 4.8 8.5 9.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
            <span className="text-base font-semibold tabular-nums" aria-hidden>
              {currencySymbols[item]}
            </span>
            <span className="min-w-0 truncate text-xs text-gray-500">
              {currencyLabels[item]}
            </span>
          </button>
        );
      })}
    </IconDropdown>
  );
}
