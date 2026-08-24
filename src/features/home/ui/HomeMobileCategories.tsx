"use client";

import { useRef, useState } from "react";

import { HOME_HORIZONTAL_SCROLL } from "@/features/home/ui/home-motion";
import {
  HomeMobileCategoryStage,
  type HomeMobileCategorySlide,
} from "@/features/home/ui/HomeMobileCategoryStage";
import type { WheelDirection } from "@/features/home/ui/HomeMobilePlateWheel";

type HomeMobileCategoriesProps = {
  productCountLabel: string;
  emptyLabel: string;
  viewAllLabel: string;
  viewAllHref: string;
  previousLabel: string;
  nextLabel: string;
  categories: readonly HomeMobileCategorySlide[];
};

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

const WHEEL_LOCK_MS = 480;

function shortestDirection(
  from: number,
  to: number,
  length: number,
): WheelDirection {
  const forward = wrapIndex(to - from, length);
  const backward = wrapIndex(from - to, length);
  return forward <= backward ? 1 : -1;
}

/**
 * Mobile home categories — pills + plated carousel (Figma 196:205 / 181:482).
 */
export function HomeMobileCategories({
  productCountLabel,
  emptyLabel,
  viewAllLabel,
  viewAllHref,
  previousLabel,
  nextLabel,
  categories,
}: HomeMobileCategoriesProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<WheelDirection>(1);
  const lockRef = useRef(false);
  const count = categories.length;
  const current = categories[index];
  const loops = count > 1;
  const prevSlide = loops ? categories[wrapIndex(index - 1, count)] : null;
  const nextSlide = loops ? categories[wrapIndex(index + 1, count)] : null;

  function moveBy(delta: WheelDirection): void {
    if (lockRef.current || !loops) {
      return;
    }
    lockRef.current = true;
    setDirection(delta);
    setIndex((value) => wrapIndex(value + delta, count));
    window.setTimeout(() => {
      lockRef.current = false;
    }, WHEEL_LOCK_MS);
  }

  function moveTo(target: number): void {
    if (target === index || lockRef.current) {
      return;
    }
    lockRef.current = true;
    setDirection(shortestDirection(index, target, count));
    setIndex(target);
    window.setTimeout(() => {
      lockRef.current = false;
    }, WHEEL_LOCK_MS);
  }

  if (count === 0 || !current) {
    return (
      <p className="px-6 pt-8 text-center text-white/70">{emptyLabel}</p>
    );
  }

  return (
    <section className="relative z-[1] overflow-x-clip pt-6 pb-0">
      <div
        data-node-id="196:205"
        className={`${HOME_HORIZONTAL_SCROLL} px-6`}
      >
        <div className="flex w-max items-center gap-2">
          {categories.map((category, categoryIndex) => {
            const active = categoryIndex === index;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => moveTo(categoryIndex)}
                aria-pressed={active}
                className={`rounded-[50px] px-4 py-2 text-[16px] leading-6 whitespace-nowrap transition-colors ${
                  active
                    ? "bg-white font-semibold text-[rgba(34,34,34,0.9)]"
                    : "bg-white/10 font-normal text-white/90 hover:bg-white/15"
                }`}
              >
                {category.title}
              </button>
            );
          })}
        </div>
      </div>

      <HomeMobileCategoryStage
        current={current}
        prev={prevSlide ?? null}
        next={nextSlide ?? null}
        productCountLabel={productCountLabel}
        viewAllLabel={viewAllLabel}
        viewAllHref={viewAllHref}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        onPrev={() => moveBy(-1)}
        onNext={() => moveBy(1)}
        loop={loops}
        direction={direction}
      />
    </section>
  );
}
