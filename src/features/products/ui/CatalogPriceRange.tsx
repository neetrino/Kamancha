"use client";

import { useId } from "react";

import type { CatalogPriceBounds } from "@/features/products/application/catalog-price-bounds";
import { CATALOG_PRICE_FILTER_MAX } from "@/features/products/schemas/catalog-list";
import type { Currency } from "@/lib/money/currency";
import { currencySymbols } from "@/lib/money/currency";

type CatalogPriceRangeProps = {
  label: string;
  currency: Currency;
  bounds: CatalogPriceBounds;
  minValue: number;
  maxValue: number;
  onRangeChange: (min: number, max: number) => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function formatBound(value: number, symbol: string): string {
  const grouped = String(Math.round(value)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "\u00A0",
  );
  return `${grouped}${symbol}`;
}

/**
 * Dual-thumb price slider — Figma PriceRangeSlider (103:1344) on forest sidebar.
 */
export function CatalogPriceRange({
  label,
  currency,
  bounds,
  minValue,
  maxValue,
  onRangeChange,
}: CatalogPriceRangeProps) {
  const baseId = useId();
  const symbol = currencySymbols[currency];

  const sliderMin = Math.min(bounds.min, minValue);
  const sliderMax = Math.max(bounds.max, maxValue, sliderMin + 1);
  const span = Math.max(1, sliderMax - sliderMin);
  const minPercent = ((minValue - sliderMin) / span) * 100;
  const maxPercent = ((maxValue - sliderMin) / span) * 100;

  function commitMin(next: number): void {
    onRangeChange(
      clamp(next, 0, Math.min(maxValue, CATALOG_PRICE_FILTER_MAX)),
      maxValue,
    );
  }

  function commitMax(next: number): void {
    onRangeChange(
      minValue,
      clamp(next, minValue, CATALOG_PRICE_FILTER_MAX),
    );
  }

  return (
    <div data-node-id="103:1344" className="w-full">
      <h3 className="font-big-fat-boii text-[18px] leading-[27px] font-normal tracking-[0.45px] text-white uppercase">
        {label}
      </h3>

      <div className="pt-4">
        <div className="flex items-start justify-between gap-5 text-[14px] leading-5 text-white/70">
          <span>{formatBound(minValue, symbol)}</span>
          <span>{formatBound(maxValue, symbol)}</span>
        </div>

        <div className="relative mt-3 h-[11px]">
          <div
            className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/20"
            aria-hidden
          />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#a2d39c]"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
            aria-hidden
          />
          <input
            id={`${baseId}-min`}
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={1}
            value={minValue}
            aria-label={`${label} min`}
            className="catalog-price-range absolute inset-0 z-20 w-full appearance-none bg-transparent"
            onChange={(event) => {
              commitMin(Number.parseInt(event.target.value, 10));
            }}
          />
          <input
            id={`${baseId}-max`}
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={1}
            value={maxValue}
            aria-label={`${label} max`}
            className="catalog-price-range absolute inset-0 z-30 w-full appearance-none bg-transparent"
            onChange={(event) => {
              commitMax(Number.parseInt(event.target.value, 10));
            }}
          />
        </div>
      </div>
    </div>
  );
}
