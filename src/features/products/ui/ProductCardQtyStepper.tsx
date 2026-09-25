"use client";

import type { MouseEvent } from "react";
import { Minus, Plus } from "lucide-react";

import { formatPiecesCount } from "@/features/cart/domain/plain-line";

type StepperScale = "compact" | "catalog" | "regular";

type ProductCardQtyStepperProps = {
  quantity: number;
  piecesTemplate: string;
  decreaseLabel: string;
  increaseLabel: string;
  disableIncrease: boolean;
  scale: StepperScale;
  onDecrease: (event: MouseEvent<HTMLButtonElement>) => void;
  onIncrease: (event: MouseEvent<HTMLButtonElement>) => void;
};

const BUTTON =
  "flex items-center justify-center rounded-full border-2 border-brand-forest bg-white text-brand-forest transition hover:bg-brand-forest/5 disabled:cursor-not-allowed disabled:opacity-40";

const SCALE: Record<StepperScale, { button: string; count: string; icon: string }> =
  {
    compact: {
      button: "size-7",
      count: "min-w-6 text-lg",
      icon: "size-3.5",
    },
    catalog: {
      button: "size-7 xl:size-9",
      count: "min-w-6 text-lg xl:min-w-7 xl:text-xl",
      icon: "size-3.5 xl:size-4",
    },
    regular: {
      button: "size-9",
      count: "min-w-7 text-xl",
      icon: "size-4",
    },
  };

/** Quantity control shown on a product card once the dish is in the bag. */
export function ProductCardQtyStepper({
  quantity,
  piecesTemplate,
  decreaseLabel,
  increaseLabel,
  disableIncrease,
  scale,
  onDecrease,
  onIncrease,
}: ProductCardQtyStepperProps) {
  const ui = SCALE[scale];
  const pieces = formatPiecesCount(piecesTemplate, quantity);

  return (
    <div
      className="flex items-center gap-1.5 bg-white pl-1"
      role="group"
      aria-label={pieces}
    >
      <button
        type="button"
        className={`${BUTTON} ${ui.button}`}
        aria-label={decreaseLabel}
        onClick={onDecrease}
      >
        <Minus className={ui.icon} strokeWidth={2.75} aria-hidden />
      </button>
      <span
        className={`text-center font-semibold leading-none whitespace-nowrap text-brand-forest tabular-nums ${ui.count}`}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        className={`${BUTTON} ${ui.button}`}
        aria-label={increaseLabel}
        disabled={disableIncrease}
        onClick={onIncrease}
      >
        <Plus className={ui.icon} strokeWidth={2.75} aria-hidden />
      </button>
    </div>
  );
}
