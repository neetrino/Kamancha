"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { HomeCategorySwitchers } from "@/features/home/ui/HomeCategorySwitchers";
import { HomeDiamondMark } from "@/features/home/ui/HomeDiamondMark";
import { HomeReveal } from "@/features/home/ui/home-motion";
import {
  HomeMobilePlateWheel,
  type HomeMobileCategorySlide,
  type WheelDirection,
} from "@/features/home/ui/HomeMobilePlateWheel";
import { HOME_HERO_PLATE_SRC } from "@/lib/brand/assets";

export type { HomeMobileCategorySlide };

type HomeMobileCategoryStageProps = {
  current: HomeMobileCategorySlide;
  prev: HomeMobileCategorySlide | null;
  next: HomeMobileCategorySlide | null;
  productCountLabel: string;
  viewAllLabel: string;
  previousLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  /** When true, switchers stay enabled and wrap around. */
  loop?: boolean;
  direction?: WheelDirection;
};

function formatProductCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
}

/**
 * Plated category carousel stage — Figma 181:482 / 196:214.
 */
export function HomeMobileCategoryStage({
  current,
  prev,
  next,
  productCountLabel,
  viewAllLabel,
  previousLabel,
  nextLabel,
  onPrev,
  onNext,
  loop = false,
  direction = 1,
}: HomeMobileCategoryStageProps) {
  return (
    <div className="relative mt-2 pt-6 pb-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-24px] z-0 h-[765px] overflow-x-clip"
        data-node-id="181:476"
      >
        <div className="absolute top-0 left-1/2 size-[765px] -translate-x-1/2">
          <Image
            src={HOME_HERO_PLATE_SRC}
            alt=""
            width={1370}
            height={1370}
            sizes="765px"
            className="size-full rotate-180 rounded-full object-cover"
          />
        </div>
      </div>

      <HomeReveal immediate className="relative z-[1]">
        <HomeMobilePlateWheel
          current={current}
          prev={prev}
          next={next}
          direction={direction}
        />

        <div
          className="mt-4 flex flex-col items-center"
          data-node-id="181:503"
        >
          <HomeDiamondMark tone="forest" className="mb-1" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center"
            >
              <p className="text-[18px] leading-6 font-semibold text-[rgba(34,34,34,0.9)]">
                {current.title}
              </p>
              <p className="text-[16px] leading-[30px] text-black/55">
                {formatProductCount(productCountLabel, current.productCount)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-2">
          <HomeCategorySwitchers
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            canPrev={loop || Boolean(prev)}
            canNext={loop || Boolean(next)}
            onPrev={onPrev}
            onNext={onNext}
          />
        </div>

        <div className="mt-5 flex justify-center">
          <KamanchaPillButton
            href={current.href}
            label={viewAllLabel}
            variant="dark"
            size="compact"
            figmaNodeId="181:496"
          />
        </div>
      </HomeReveal>
    </div>
  );
}
