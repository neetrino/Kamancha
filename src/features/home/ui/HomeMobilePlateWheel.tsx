"use client";

import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useEffect, useState } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { plateWheelTransition } from "@/features/home/ui/home-plate-motion";
import type {
  PlateSlot,
  PlateToken,
  WheelDirection,
} from "@/features/home/ui/home-plate-tokens";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";
import { HOME_MOBILE_CATEGORY_DISH_SRC } from "@/lib/brand/assets";

export type { WheelDirection } from "@/features/home/ui/home-plate-tokens";

export type HomeMobileCategorySlide = {
  id: string;
  title: string;
  href: string;
  productCount: number;
  imageUrl: string | null;
};

type HomeMobilePlateWheelProps = {
  categories: readonly HomeMobileCategorySlide[];
  tokens: readonly PlateToken[];
  direction: WheelDirection;
  /** Phone vs iPad slot poses — must match token layout from the parent. */
  tablet: boolean;
};

const PLATE_W = 222;
const PLATE_H = 154;

const phoneSlotVariants: Variants = {
  prev: { x: 181, y: 80, scale: 0.8, opacity: 0.8, rotate: 16, zIndex: 1 },
  current: { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0, zIndex: 3 },
  next: { x: -181, y: 80, scale: 0.8, opacity: 0.8, rotate: -16, zIndex: 1 },
  /** Appear / vanish below the rim — not sideways. */
  enterForward: {
    x: -181,
    y: 200,
    scale: 0.62,
    opacity: 0,
    rotate: -16,
    zIndex: 0,
  },
  exitForward: {
    x: 181,
    y: 200,
    scale: 0.62,
    opacity: 0,
    rotate: 16,
    zIndex: 0,
  },
  enterBackward: {
    x: 181,
    y: 200,
    scale: 0.62,
    opacity: 0,
    rotate: 16,
    zIndex: 0,
  },
  exitBackward: {
    x: -181,
    y: 200,
    scale: 0.62,
    opacity: 0,
    rotate: -16,
    zIndex: 0,
  },
};

const tabletSlotVariants: Variants = {
  nextFar: {
    x: -232,
    y: 212,
    scale: 0.78,
    opacity: 0.95,
    rotate: -18,
    zIndex: 0,
  },
  next: { x: -181, y: 80, scale: 0.8, opacity: 0.8, rotate: -16, zIndex: 1 },
  current: { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0, zIndex: 3 },
  prev: { x: 181, y: 80, scale: 0.8, opacity: 0.8, rotate: 16, zIndex: 1 },
  prevFar: {
    x: 232,
    y: 212,
    scale: 0.78,
    opacity: 0.95,
    rotate: 18,
    zIndex: 0,
  },
  enterForward: {
    x: -232,
    y: 360,
    scale: 0.6,
    opacity: 0,
    rotate: -18,
    zIndex: 0,
  },
  exitForward: {
    x: 232,
    y: 360,
    scale: 0.6,
    opacity: 0,
    rotate: 18,
    zIndex: 0,
  },
  enterBackward: {
    x: 232,
    y: 360,
    scale: 0.6,
    opacity: 0,
    rotate: 18,
    zIndex: 0,
  },
  exitBackward: {
    x: -232,
    y: 360,
    scale: 0.6,
    opacity: 0,
    rotate: -18,
    zIndex: 0,
  },
};

function enterVariant(direction: WheelDirection): string {
  return direction === 1 ? "enterForward" : "enterBackward";
}

function exitVariant(direction: WheelDirection): string {
  return direction === 1 ? "exitForward" : "exitBackward";
}

function PlateImage({
  slide,
  linked,
}: {
  slide: HomeMobileCategorySlide;
  linked: boolean;
}) {
  const photoUrl =
    typeof slide.imageUrl === "string" && slide.imageUrl.length > 0
      ? slide.imageUrl
      : null;
  const src = photoUrl ?? HOME_MOBILE_CATEGORY_DISH_SRC;

  /**
   * Same frame for every category. `object-contain` = as large as possible
   * inside the box without cropping (the “one more pixel would clip” limit).
   */
  return (
    <div className="absolute top-1/2 left-1/2 size-[222px] -translate-x-1/2 -translate-y-1/2">
      <Image
        src={src}
        alt=""
        fill
        sizes="222px"
        className="object-contain object-center"
        priority
      />
      {linked ? (
        <AppLink
          href={slide.href}
          prefetchPolicy="intent"
          aria-label={slide.title}
          className="absolute inset-0"
        />
      ) : null}
    </div>
  );
}

/**
 * Conveyor wheel — Motion mounts only after hydration so SSR markup matches.
 * Forward: enter left, exit right.
 */
export function HomeMobilePlateWheel({
  categories,
  tokens,
  direction,
  tablet,
}: HomeMobilePlateWheelProps) {
  const [mounted, setMounted] = useState(false);
  const playMotion = usePlayHomeMotion();
  const transition = plateWheelTransition(playMotion && mounted);
  const variants = tablet ? tabletSlotVariants : phoneSlotVariants;

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentToken = tokens.find((plate) => plate.slot === "current");
  const currentSlide =
    currentToken != null
      ? categories[currentToken.categoryIndex]
      : categories[0];

  return (
    <div className="relative mx-auto h-[154px] w-[222px] min-[744px]:w-full">
      {/*
        Tall tablet layer is pointer-events-none so exit/enter dishes and the
        empty overlay cannot steal taps from the switchers underneath.
      */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 z-[1] h-[154px] w-[222px] -translate-x-1/2 min-[744px]:h-[400px] min-[744px]:w-full"
        data-node-id="181:482"
      >
        {!mounted ? (
          currentSlide ? (
            <div
              className="pointer-events-auto absolute top-0 left-1/2"
              style={{
                width: PLATE_W,
                height: PLATE_H,
                marginLeft: -PLATE_W / 2,
              }}
            >
              <PlateImage slide={currentSlide} linked />
            </div>
          ) : null
        ) : (
          <div className="absolute inset-0">
            <AnimatePresence initial={false} mode="sync" custom={direction}>
              {tokens.map((plate) => {
                const slide = categories[plate.categoryIndex];
                if (!slide) {
                  return null;
                }
                const slot = plate.slot as PlateSlot;
                const isCurrent = slot === "current";

                return (
                  <motion.div
                    key={plate.instanceId}
                    className={`absolute top-0 left-1/2 ${
                      isCurrent
                        ? "pointer-events-auto"
                        : "pointer-events-none"
                    }`}
                    style={{
                      width: PLATE_W,
                      height: PLATE_H,
                      marginLeft: -PLATE_W / 2,
                      transformOrigin: "center center",
                    }}
                    variants={variants}
                    initial={playMotion ? enterVariant(direction) : false}
                    animate={slot}
                    exit={playMotion ? exitVariant(direction) : undefined}
                    transition={transition}
                  >
                    <PlateImage slide={slide} linked={isCurrent} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
