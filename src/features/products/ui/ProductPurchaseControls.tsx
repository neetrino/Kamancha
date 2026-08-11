"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

import { addToCart } from "@/features/cart/cart";
import type { ProductModifierChoice } from "@/features/products/types";

const CART_PLUS_SRC = "/assets/brand/product/cart-plus-dark.svg";

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
  const maxQty = Math.max(stockOnHand, 0);
  const [quantity, setQuantity] = useState(maxQty > 0 ? 1 : 0);
  const [additionIds, setAdditionIds] = useState<string[]>([]);
  const [exceptionIds, setExceptionIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const disabled = maxQty < 1;

  const additionExtras = useMemo(() => {
    const byId = new Map(additions.map((row) => [row.id, row.priceAmount]));
    return additionIds.reduce((sum, id) => sum + (byId.get(id) ?? 0), 0);
  }, [additionIds, additions]);

  function changeQuantity(next: number): void {
    if (disabled) return;
    setQuantity(Math.min(Math.max(1, next), maxQty));
    setMessage(null);
    setError(null);
  }

  function handleAdd(): void {
    if (disabled || quantity < 1) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        await addToCart(productId, quantity, {
          modifierIds: [...additionIds, ...exceptionIds],
        });
        setMessage(labels.added);
      } catch {
        setError(labels.error);
      }
    });
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div
        data-node-id="106:3285"
        className="flex h-20 w-full flex-nowrap items-center justify-between gap-6 xl:gap-[102px]"
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

        <div className="flex shrink-0 flex-nowrap items-center justify-end gap-6 sm:gap-[43px]">
          <div className="inline-flex h-[52px] w-[144px] items-center overflow-hidden rounded-[50px] bg-white/10">
            <button
              type="button"
              aria-label={labels.decreaseQuantity}
              disabled={disabled || quantity <= 1 || pending}
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
              disabled={disabled || quantity >= maxQty || pending}
              onClick={() => changeQuantity(quantity + 1)}
              className="flex size-[52px] items-center justify-center text-2xl font-light text-white transition hover:bg-white/10 disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            disabled={disabled || pending}
            onClick={handleAdd}
            className="inline-flex h-14 shrink-0 items-center gap-3 rounded-[50px] bg-white px-7 text-base font-semibold whitespace-nowrap text-brand-forest transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Image
              src={CART_PLUS_SRC}
              alt=""
              width={26}
              height={22}
              aria-hidden
            />
            {disabled
              ? labels.outOfStock
              : pending
                ? labels.adding
                : labels.addToCart}
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
        disabled={disabled || pending}
        showPriceHint={false}
        onToggle={(id) => setExceptionIds((prev) => toggleId(prev, id))}
      />

      <ModifierCheckboxGrid
        title={labels.additions}
        options={additions}
        selectedIds={additionIds}
        disabled={disabled || pending}
        showPriceHint
        onToggle={(id) => setAdditionIds((prev) => toggleId(prev, id))}
      />

      {message ? (
        <p className="text-sm text-[#84d086]" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
