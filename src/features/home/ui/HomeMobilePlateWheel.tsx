"use client";

import Image from "next/image";
import { AnimatePresence, motion, type Transition } from "motion/react";

import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";
import { STOREFRONT_PRODUCT_PHOTO } from "@/lib/media/storefront-product-photo";

export type WheelDirection = 1 | -1;

export type HomeMobileCategorySlide = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
  productCount: number;
};

type HomeMobilePlateWheelProps = {
  current: HomeMobileCategorySlide;
  prev: HomeMobileCategorySlide | null;
  next: HomeMobileCategorySlide | null;
  direction: WheelDirection;
};

type PlateSlot = "prev" | "current" | "next";

type PlatePose = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotate: number;
  zIndex: number;
};

const PLATE_W = 222;
const PLATE_H = 154;

/** Upper arc — next sits left so a right-arrow step travels rightward. */
const SLOT_POSE: Record<PlateSlot, PlatePose> = {
  prev: { x: 181, y: 80, scale: 0.8, opacity: 0.8, rotate: 16, zIndex: 1 },
  current: { x: 0, y: 0, scale: 1, opacity: 1, rotate: 0, zIndex: 3 },
  next: { x: -181, y: 80, scale: 0.8, opacity: 0.8, rotate: -16, zIndex: 1 },
};

const ENTER_RIGHT: PlatePose = {
  x: 300,
  y: 150,
  scale: 0.55,
  opacity: 0,
  rotate: 28,
  zIndex: 0,
};
const ENTER_LEFT: PlatePose = {
  x: -300,
  y: 150,
  scale: 0.55,
  opacity: 0,
  rotate: -28,
  zIndex: 0,
};

const springMove: Transition = {
  type: "spring",
  stiffness: 52,
  damping: 18,
  mass: 0.95,
};

function categoryPhoto(imageUrl: string | null): string {
  return imageUrl ?? STOREFRONT_PRODUCT_PHOTO;
}

function poseForEnter(direction: WheelDirection): PlatePose {
  return direction === 1 ? ENTER_LEFT : ENTER_RIGHT;
}

function poseForExit(direction: WheelDirection): PlatePose {
  return direction === 1 ? ENTER_RIGHT : ENTER_LEFT;
}

/**
 * Three dishes travel along the plate rim when the category index changes.
 */
export function HomeMobilePlateWheel({
  current,
  prev,
  next,
  direction,
}: HomeMobilePlateWheelProps) {
  const playMotion = usePlayHomeMotion();
  const transition: Transition = playMotion ? springMove : { duration: 0 };
  const plates: Array<{ slide: HomeMobileCategorySlide; slot: PlateSlot }> = [];

  if (prev) {
    plates.push({ slide: prev, slot: "prev" });
  }
  plates.push({ slide: current, slot: "current" });
  if (next && next.id !== prev?.id) {
    plates.push({ slide: next, slot: "next" });
  }

  return (
    <div
      className="relative mx-auto h-[154px] w-[222px]"
      data-node-id="181:482"
    >
      <AnimatePresence initial={false} custom={direction}>
        {plates.map(({ slide, slot }) => (
          <motion.div
            key={slide.id}
            className="pointer-events-none absolute top-0 left-0"
            style={{ width: PLATE_W, height: PLATE_H }}
            initial={playMotion ? poseForEnter(direction) : SLOT_POSE[slot]}
            animate={SLOT_POSE[slot]}
            exit={playMotion ? poseForExit(direction) : SLOT_POSE[slot]}
            transition={transition}
          >
            <Image
              src={categoryPhoto(slide.imageUrl)}
              alt={slot === "current" ? slide.title : ""}
              fill
              sizes={slot === "current" ? "222px" : "178px"}
              className="object-contain object-center"
              priority={slot === "current"}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
