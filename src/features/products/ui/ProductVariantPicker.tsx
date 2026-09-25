"use client";

import {
  pickVariantForValue,
  selectionFromOptions,
} from "@/features/products/domain/variant-selection";
import type {
  ProductVariantAxis,
  ProductVariantChoice,
} from "@/features/products/types";

type ProductVariantPickerProps = {
  axes: ProductVariantAxis[];
  variants: ProductVariantChoice[];
  selectedId: string;
  onSelect: (variantId: string) => void;
};

/** Exclusive attribute chips. One value per axis resolves to a variant. */
export function ProductVariantPicker({
  axes,
  variants,
  selectedId,
  onSelect,
}: ProductVariantPickerProps) {
  const selected = variants.find((variant) => variant.id === selectedId) ?? null;
  const selection = selectionFromOptions(selected?.options ?? []);

  if (axes.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {axes.map((axis) => (
        <div key={axis.id} className="flex flex-col gap-2">
          <h2 className="font-big-fat-boii text-lg leading-[22px] font-normal tracking-[0.3px] text-white uppercase">
            {axis.title}
          </h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label={axis.title}>
            {axis.values.map((value) => {
              const pressed = selection[axis.id] === value.id;
              return (
                <button
                  key={value.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => {
                    const next = pickVariantForValue(
                      variants,
                      selection,
                      axis.id,
                      value.id,
                    );
                    if (next) onSelect(next.id);
                  }}
                  className={`rounded-full px-4 py-2 text-sm leading-5 transition ${
                    pressed
                      ? "bg-white font-semibold text-black"
                      : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15"
                  }`}
                >
                  {value.title}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
