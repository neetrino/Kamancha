"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

import { plateWheelTransition } from "@/features/home/ui/home-plate-motion";
import type {
  HomeMobileCategorySlide,
  WheelDirection,
} from "@/features/home/ui/HomeMobilePlateWheel";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";
import { HOME_MOBILE_CATEGORY_DISH_SRC } from "@/lib/brand/assets";

type Side = "left" | "right";

type HomeMobileSidePlatesProps = {
  left: HomeMobileCategorySlide | null;
  right: HomeMobileCategorySlide | null;
  direction: WheelDirection;
};

const PLATE_W = 222;
const PLATE_H = 154;

/** Horizontal offset from stage center — inside the big plate rim. */
const SIDE_OFFSET_X_PX = 232;
/** Vertical position — mid white plate, near title/switchers. */
const SIDE_TOP_PX = 236;
const SIDE_SCALE = 0.78;
const SIDE_TILT_DEG = 18;

/**
 * iPad side dishes — sit on the big plate rim at mid-height (not the top arc).
 * Hidden below 744px.
 */
export function HomeMobileSidePlates({
  left,
  right,
  direction,
}: HomeMobileSidePlatesProps) {
  const playMotion = usePlayHomeMotion();
  const transition = plateWheelTransition(playMotion);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-[2] hidden h-full min-[744px]:block"
    >
      <SidePlate
        side="left"
        slide={left}
        direction={direction}
        playMotion={playMotion}
        transition={transition}
      />
      <SidePlate
        side="right"
        slide={right}
        direction={direction}
        playMotion={playMotion}
        transition={transition}
      />
    </div>
  );
}

function SidePlate({
  side,
  slide,
  direction,
  playMotion,
  transition,
}: {
  side: Side;
  slide: HomeMobileCategorySlide | null;
  direction: WheelDirection;
  playMotion: boolean;
  transition: ReturnType<typeof plateWheelTransition>;
}) {
  const isLeft = side === "left";
  const offsetX = isLeft ? -SIDE_OFFSET_X_PX : SIDE_OFFSET_X_PX;
  const tilt = isLeft ? -SIDE_TILT_DEG : SIDE_TILT_DEG;

  return (
    <div
      className="absolute left-1/2"
      style={{
        top: SIDE_TOP_PX,
        width: PLATE_W,
        height: PLATE_H,
        transform: `translateX(calc(-50% + ${offsetX}px)) rotate(${tilt}deg)`,
      }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {slide ? (
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={
              playMotion
                ? { opacity: 0, x: isLeft ? -20 : 20, scale: SIDE_SCALE + 0.08 }
                : false
            }
            animate={{ opacity: 0.95, x: 0, scale: SIDE_SCALE }}
            exit={
              playMotion
                ? { opacity: 0, x: isLeft ? 20 : -20, scale: SIDE_SCALE + 0.08 }
                : undefined
            }
            transition={playMotion ? transition : { duration: 0 }}
          >
            <Image
              src={HOME_MOBILE_CATEGORY_DISH_SRC}
              alt=""
              fill
              sizes="174px"
              className="object-contain object-center"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
