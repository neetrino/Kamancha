"use client";

import { useRef, useState } from "react";

import { HomeMobileCategoryPills } from "@/features/home/ui/HomeMobileCategoryPills";
import {
  HomeMobileCategoryStage,
  type HomeMobileCategorySlide,
} from "@/features/home/ui/HomeMobileCategoryStage";
import {
  HOME_PLATE_RIM_STEP_DEG,
  HOME_PLATE_WHEEL_LOCK_MS,
} from "@/features/home/ui/home-plate-motion";
import type { WheelDirection } from "@/features/home/ui/HomeMobilePlateWheel";

type HomeMobileCategoriesProps = {
  productCountLabel: string;
  emptyLabel: string;
  viewAllLabel: string;
  previousLabel: string;
  nextLabel: string;
  categories: readonly HomeMobileCategorySlide[];
};

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

/**
 * Mobile home categories — pills + plated carousel (Figma 196:205 / 181:482).
 * Pills open the menu with that category selected; arrows walk the carousel.
 */
export function HomeMobileCategories({
  productCountLabel,
  emptyLabel,
  viewAllLabel,
  previousLabel,
  nextLabel,
  categories,
}: HomeMobileCategoriesProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<WheelDirection>(1);
  const [plateRotation, setPlateRotation] = useState(0);
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
    setPlateRotation((value) => value - delta * HOME_PLATE_RIM_STEP_DEG);
    setIndex((value) => wrapIndex(value + delta, count));
    window.setTimeout(() => {
      lockRef.current = false;
    }, HOME_PLATE_WHEEL_LOCK_MS);
  }

  if (count === 0 || !current) {
    return (
      <p className="px-6 pt-8 text-center text-white/70">{emptyLabel}</p>
    );
  }

  return (
    <section className="relative z-[1] overflow-x-clip pt-6 pb-0">
      <HomeMobileCategoryPills
        categories={categories}
        index={index}
        direction={direction}
      />

      <HomeMobileCategoryStage
        current={current}
        prev={prevSlide ?? null}
        next={nextSlide ?? null}
        productCountLabel={productCountLabel}
        viewAllLabel={viewAllLabel}
        viewAllHref={current.href}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        onPrev={() => moveBy(-1)}
        onNext={() => moveBy(1)}
        loop={loops}
        direction={direction}
        plateRotation={plateRotation}
      />
    </section>
  );
}
