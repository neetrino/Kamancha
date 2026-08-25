"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { HomeCategorySwitchers } from "@/features/home/ui/HomeCategorySwitchers";
import { HomeDiamondMark } from "@/features/home/ui/HomeDiamondMark";
import { HOME_PLATE_WHEEL_SPRING } from "@/features/home/ui/home-plate-motion";
import { HomeReveal } from "@/features/home/ui/home-motion";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";
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
  viewAllHref: string;
  previousLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  /** When true, switchers stay enabled and wrap around. */
  loop?: boolean;
  direction?: WheelDirection;
  plateRotation?: number;
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
  viewAllHref,
  previousLabel,
  nextLabel,
  onPrev,
  onNext,
  loop = false,
  direction = 1,
  plateRotation = 0,
}: HomeMobileCategoryStageProps) {
  const playMotion = usePlayHomeMotion();
  const plateTransition = playMotion ? HOME_PLATE_WHEEL_SPRING : { duration: 0 };

  return (
    <div className="relative mt-2 pt-6 pb-2">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-24px] z-0 h-[765px] overflow-x-clip"
        data-node-id="181:476"
      >
        <motion.div
          className="absolute top-0 left-1/2 size-[765px] -translate-x-1/2 will-change-transform"
          animate={{ rotate: 180 + plateRotation }}
          transition={plateTransition}
        >
          <Image
            src={HOME_HERO_PLATE_SRC}
            alt=""
            width={1370}
            height={1370}
            sizes="765px"
            className="size-full rounded-full object-cover"
          />
        </motion.div>
      </div>

      <HomeReveal className="relative z-[1]">
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
          <p className="text-[18px] leading-6 font-semibold text-[rgba(34,34,34,0.9)]">
            {current.title}
          </p>
          <p className="text-[16px] leading-[30px] text-black/55">
            {formatProductCount(productCountLabel, current.productCount)}
          </p>
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
            href={viewAllHref}
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
