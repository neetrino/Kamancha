"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { flyToCart } from "@/features/cart/ui/fly-to-cart";
import { addProductToActiveCart } from "@/features/group-orders/application/add-to-active";
import type { ProductModifierChoice } from "@/features/products/types";
import { showStorefrontAlert } from "@/features/storefront-chrome/storefront-alert-store";
import {
  adjustCartItemCount,
  settleCartItemCountAdjust,
} from "@/features/storefront-chrome/storefront-counts-store";
import type { Currency } from "@/lib/money/currency";
import { defaultCurrency } from "@/lib/money/currency";
import { convertAmount } from "@/lib/money/convert";
import { formatMoneyAmount } from "@/lib/money/format";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const CART_PLUS_SRC = staticAssetUrl("/assets/brand/product/cart-plus-dark.svg");

type ProductPurchaseControlsProps = {
  productId: string;
  stockOnHand: number;
  /** Base unit price in AMD minor units (before additions). */
  priceAmount: number;
  compareAtFormatted: string | null;
  currency: Currency;
  locale: string;
  fxRate: string;
  additions: ProductModifierChoice[];
  exceptions: ProductModifierChoice[];
  /** Hide the inline price on mobile when it is shown under the title instead. */
  hidePriceOnMobile?: boolean;
  onPriceFormattedChange?: (formatted: string) => void;
  labels: {
    quantity: string;
    decreaseQuantity: string;
    increaseQuantity: string;
    addToCart: string;
    addToCartShort: string;
    adding: string;
    outOfStock: string;
    added: string;
    error: string;
    additions: string;
    exceptions: string;
  };
};

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((row) => row !== id) : [...ids, id];
}

type ModifierCheckboxGridProps = {
  title: string;
  options: ProductModifierChoice[];
  selectedIds: string[];
  disabled: boolean;
  onToggle: (id: string) => void;
};

function ModifierCheckboxGrid({
  title,
  options,
  selectedIds,
  disabled,
  onToggle,
}: ModifierCheckboxGridProps) {
  const [open, setOpen] = useState(false);

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-left xl:pointer-events-none"
      >
        <h2 className="font-big-fat-boii text-lg leading-[22px] font-normal tracking-[0.3px] text-white uppercase">
          {title}
        </h2>
        <ChevronDown
          aria-hidden
          className={`size-5 shrink-0 text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] xl:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] xl:grid-rows-[1fr] xl:opacity-100 xl:pointer-events-auto ${
          open
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {options.map((option) => {
              const checked = selectedIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={disabled}
                  aria-pressed={checked}
                  onClick={() => onToggle(option.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left transition disabled:opacity-50 ${
                    checked
                      ? "bg-white/20 ring-1 ring-white/40"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`flex size-[18px] shrink-0 items-center justify-center rounded border-2 ${
                      checked
                        ? "border-white bg-white"
                        : "border-white/40 bg-transparent"
                    }`}
                  >
                    {checked ? (
                      <span className="block size-2 rounded-[1px] bg-brand-forest" />
                    ) : null}
                  </span>
                  <span className="min-w-0 text-[13px] leading-5 text-white">
                    {option.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductPurchaseControls({
  productId,
  stockOnHand,
  priceAmount,
  compareAtFormatted,
  currency,
  locale,
  fxRate,
  additions = [],
  exceptions = [],
  hidePriceOnMobile = false,
  onPriceFormattedChange,
  labels,
}: ProductPurchaseControlsProps) {
  const router = useRouter();
  const maxQty = Math.max(stockOnHand, 0);
  const [quantity, setQuantity] = useState(maxQty > 0 ? 1 : 0);
  const [additionIds, setAdditionIds] = useState<string[]>([]);
  const [exceptionIds, setExceptionIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const disabled = maxQty < 1;

  const priceFormatted = useMemo(() => {
    const byId = new Map(additions.map((row) => [row.id, row.priceAmount]));
    const extras = additionIds.reduce(
      (sum, id) => sum + (byId.get(id) ?? 0),
      0,
    );
    const totalAmd = priceAmount + extras;
    const converted = convertAmount(
      totalAmd,
      fxRate,
      defaultCurrency,
      currency,
    );
    return formatMoneyAmount(converted.amount, currency, locale);
  }, [additionIds, additions, currency, fxRate, locale, priceAmount]);

  useEffect(() => {
    onPriceFormattedChange?.(priceFormatted);
  }, [onPriceFormattedChange, priceFormatted]);

  function changeQuantity(next: number): void {
    if (disabled) return;
    setQuantity(Math.min(Math.max(1, next), maxQty));
    setError(null);
  }

  function handleAdd(): void {
    if (disabled || quantity < 1) return;
    setError(null);
    const origin = addButtonRef.current;

    const selectedModifiers = [...additionIds, ...exceptionIds];
    void addProductToActiveCart(productId, quantity, {
      modifierIds: selectedModifiers,
    })
      .then((result) => {
        if (!result.ok) {
          setError(result.error);
          showStorefrontAlert(result.error);
          return;
        }
        if (origin) {
          flyToCart(origin);
        }
        adjustCartItemCount(quantity);
        settleCartItemCountAdjust();
        if (result.target !== "cart") {
          router.refresh();
        }
      })
      .catch(() => {
        setError(labels.error);
        showStorefrontAlert(labels.error);
      });
  }

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-6 xl:grid-cols-[auto_1fr] xl:items-center">
      <div
        className={`col-start-1 row-start-1 shrink-0 flex-col items-start gap-px ${
          hidePriceOnMobile ? "hidden xl:flex" : "flex"
        }`}
      >
        <p className="whitespace-nowrap text-4xl leading-9 font-bold text-white">
          {priceFormatted}
        </p>
        {compareAtFormatted ? (
          <p className="whitespace-nowrap text-[19px] leading-4 text-white/45 line-through">
            {compareAtFormatted}
          </p>
        ) : null}
      </div>

      <div className="col-start-1 row-start-2 flex w-full flex-col gap-6 xl:col-span-2 xl:row-start-2">
        <ModifierCheckboxGrid
          title={labels.exceptions}
          options={exceptions}
          selectedIds={exceptionIds}
          disabled={disabled}
          onToggle={(id) => setExceptionIds((prev) => toggleId(prev, id))}
        />

        <ModifierCheckboxGrid
          title={labels.additions}
          options={additions}
          selectedIds={additionIds}
          disabled={disabled}
          onToggle={(id) => setAdditionIds((prev) => toggleId(prev, id))}
        />

        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="col-start-1 row-start-3 flex w-full min-w-0 flex-nowrap items-center gap-3 xl:col-start-2 xl:row-start-1 xl:w-auto xl:justify-self-end xl:shrink-0">
        <div className="inline-flex h-[52px] w-[144px] shrink-0 items-center overflow-hidden rounded-[50px] bg-white/10">
          <button
            type="button"
            aria-label={labels.decreaseQuantity}
            disabled={disabled || quantity <= 1}
            onClick={() => changeQuantity(quantity - 1)}
            className="flex size-[52px] items-center justify-center text-2xl font-light text-white transition hover:bg-white/10 disabled:opacity-40"
          >
            −
          </button>
          <span
            className="w-10 text-center text-lg font-semibold text-white"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label={labels.increaseQuantity}
            disabled={disabled || quantity >= maxQty}
            onClick={() => changeQuantity(quantity + 1)}
            className="flex size-[52px] items-center justify-center text-2xl font-light text-white transition hover:bg-white/10 disabled:opacity-40"
          >
            +
          </button>
        </div>

        <button
          ref={addButtonRef}
          type="button"
          disabled={disabled}
          onClick={handleAdd}
          className="inline-flex h-[52px] min-w-0 flex-1 items-center justify-center gap-2.5 rounded-[50px] bg-white px-4 text-base font-semibold text-brand-forest transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 xl:flex-none xl:shrink-0 xl:gap-3 xl:px-7"
        >
          <Image
            src={CART_PLUS_SRC}
            alt=""
            width={26}
            height={22}
            className="shrink-0"
            aria-hidden
          />
          <span className="truncate xl:hidden">
            {disabled ? labels.outOfStock : labels.addToCartShort}
          </span>
          <span className="hidden truncate xl:inline">
            {disabled ? labels.outOfStock : labels.addToCart}
          </span>
        </button>
      </div>
    </div>
  );
}
