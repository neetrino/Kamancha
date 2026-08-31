"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { flyToCart } from "@/features/cart/ui/fly-to-cart";
import { addProductToActiveCart } from "@/features/group-orders/application/add-to-active";
import type { ProductModifierChoice } from "@/features/products/types";
import { showStorefrontAlert } from "@/features/storefront-chrome/storefront-alert-store";
import {
  adjustCartItemCount,
  settleCartItemCountAdjust,
} from "@/features/storefront-chrome/storefront-counts-store";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const CART_PLUS_SRC = staticAssetUrl("/assets/brand/product/cart-plus-dark.svg");

type ProductPurchaseControlsProps = {
  productId: string;
  stockOnHand: number;
  priceFormatted: string;
  compareAtFormatted: string | null;
  additions: ProductModifierChoice[];
  exceptions: ProductModifierChoice[];
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
  showPriceHint: boolean;
  onToggle: (id: string) => void;
};

function ModifierCheckboxGrid({
  title,
  options,
  selectedIds,
  disabled,
  showPriceHint,
  onToggle,
}: ModifierCheckboxGridProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <h2 className="font-big-fat-boii text-lg leading-[22px] font-normal tracking-[0.3px] text-white uppercase">
        {title}
      </h2>
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
                {showPriceHint && option.priceAmount > 0
                  ? ` (+${option.priceAmount})`
                  : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProductPurchaseControls({
  productId,
  stockOnHand,
  priceFormatted,
  compareAtFormatted,
  additions = [],
  exceptions = [],
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

  const additionExtras = useMemo(() => {
    const byId = new Map(additions.map((row) => [row.id, row.priceAmount]));
    return additionIds.reduce((sum, id) => sum + (byId.get(id) ?? 0), 0);
  }, [additionIds, additions]);

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
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div
        data-node-id="106:3285"
        className="flex w-full min-w-0 flex-col gap-4 md:flex-row md:flex-nowrap md:items-center md:justify-between md:gap-x-4"
      >
        <div className="flex shrink-0 flex-col items-start gap-px">
          <p className="whitespace-nowrap text-4xl leading-9 font-bold text-white">
            {priceFormatted}
          </p>
          {compareAtFormatted ? (
            <p className="whitespace-nowrap text-[19px] leading-4 text-white/45 line-through">
              {compareAtFormatted}
            </p>
          ) : null}
        </div>

        <div className="flex w-full min-w-0 flex-nowrap items-center gap-3 md:w-auto md:shrink-0">
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
            className="inline-flex h-[52px] min-w-0 flex-1 items-center justify-center gap-2.5 rounded-[50px] bg-white px-4 text-base font-semibold text-brand-forest transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:shrink-0 md:gap-3 md:px-7"
          >
            <Image
              src={CART_PLUS_SRC}
              alt=""
              width={26}
              height={22}
              className="shrink-0"
              aria-hidden
            />
            <span className="truncate md:hidden">
              {disabled ? labels.outOfStock : labels.addToCartShort}
            </span>
            <span className="hidden truncate md:inline">
              {disabled ? labels.outOfStock : labels.addToCart}
            </span>
          </button>
        </div>
      </div>

      {additionExtras > 0 ? (
        <p className="text-sm text-white/60">
          +{additionExtras} × {Math.max(quantity, 1)}
        </p>
      ) : null}

      <ModifierCheckboxGrid
        title={labels.exceptions}
        options={exceptions}
        selectedIds={exceptionIds}
        disabled={disabled}
        showPriceHint={false}
        onToggle={(id) => setExceptionIds((prev) => toggleId(prev, id))}
      />

      <ModifierCheckboxGrid
        title={labels.additions}
        options={additions}
        selectedIds={additionIds}
        disabled={disabled}
        showPriceHint
        onToggle={(id) => setAdditionIds((prev) => toggleId(prev, id))}
      />

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
