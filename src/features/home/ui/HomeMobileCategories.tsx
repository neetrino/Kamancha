"use client";

import { useEffect, useRef, useState } from "react";

import { HomeMobileCategoryPills } from "@/features/home/ui/HomeMobileCategoryPills";
import {
  HomeMobileCategoryStage,
  type HomeMobileCategorySlide,
} from "@/features/home/ui/HomeMobileCategoryStage";
import {
  HOME_PLATE_RIM_STEP_DEG,
  HOME_PLATE_WHEEL_LOCK_MS,
} from "@/features/home/ui/home-plate-motion";
import {
  buildPlateTokens,
  stepPlateTokens,
  type PlateToken,
} from "@/features/home/ui/home-plate-tokens";
import type { WheelDirection } from "@/features/home/ui/home-plate-tokens";

type HomeMobileCategoriesProps = {
  productCountLabel: string;
  emptyLabel: string;
  viewAllLabel: string;
  previousLabel: string;
  nextLabel: string;
  categories: readonly HomeMobileCategorySlide[];
};

const TABLET_MQ = "(min-width: 744px)";

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function useIsTabletUp(): boolean {
  const [isTabletUp, setIsTabletUp] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(TABLET_MQ);
    function sync(): void {
      setIsTabletUp(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isTabletUp;
}

/**
 * Mobile home categories — pills + plated carousel (Figma 196:205 / 181:482).
 * iPad conveyor: one dish enters left, one exits right; the rest slide along.
 */
export function HomeMobileCategories({
  productCountLabel,
  emptyLabel,
  viewAllLabel,
  previousLabel,
  nextLabel,
  categories,
}: HomeMobileCategoriesProps) {
  const isTabletUp = useIsTabletUp();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<WheelDirection>(1);
  const [plateRotation, setPlateRotation] = useState(0);
  const [tokens, setTokens] = useState<PlateToken[]>(() =>
    buildPlateTokens(0, categories.length, false),
  );
  const lockRef = useRef(false);
  const pendingDeltaRef = useRef<WheelDirection | null>(null);
  const lockTimerRef = useRef<number | null>(null);
  const indexRef = useRef(index);
  indexRef.current = index;
  const count = categories.length;
  const current = categories[index];
  const loops = count > 1;
  const isTabletUpRef = useRef(isTabletUp);
  isTabletUpRef.current = isTabletUp;

  useEffect(() => {
    setTokens(buildPlateTokens(indexRef.current, count, isTabletUp));
  }, [isTabletUp, count]);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current != null) {
        window.clearTimeout(lockTimerRef.current);
      }
    };
  }, []);

  function applyStep(delta: WheelDirection): void {
    lockRef.current = true;
    pendingDeltaRef.current = null;
    const nextIndex = wrapIndex(indexRef.current + delta, count);
    indexRef.current = nextIndex;
    setDirection(delta);
    setPlateRotation((value) => value - delta * HOME_PLATE_RIM_STEP_DEG);
    setTokens((previous) =>
      stepPlateTokens(
        previous,
        delta,
        nextIndex,
        count,
        isTabletUpRef.current,
      ),
    );
    setIndex(nextIndex);
    lockTimerRef.current = window.setTimeout(() => {
      lockRef.current = false;
      lockTimerRef.current = null;
      const pending = pendingDeltaRef.current;
      if (pending != null) {
        applyStep(pending);
      }
    }, HOME_PLATE_WHEEL_LOCK_MS);
  }

  function moveBy(delta: WheelDirection): void {
    if (!loops) {
      return;
    }
    if (lockRef.current) {
      // Keep the latest tap so the button never feels “dead” mid-animation.
      pendingDeltaRef.current = delta;
      return;
    }
    applyStep(delta);
  }

  if (count === 0 || !current) {
    return (
      <p className="px-6 pt-8 text-center text-white/70">{emptyLabel}</p>
    );
  }

  return (
    <section className="relative z-[1] overflow-x-clip pt-6 pb-0">
      <HomeMobileCategoryPills categories={categories} index={index} />

      <HomeMobileCategoryStage
        current={current}
        categories={categories}
        tokens={tokens}
        tablet={isTabletUp}
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
