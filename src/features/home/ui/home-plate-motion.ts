import type { Transition } from "motion/react";

/** Shared spring for the mobile plate rim, dish wheel, and category pills. */
export const HOME_PLATE_WHEEL_SPRING: Transition = {
  type: "spring",
  stiffness: 46,
  damping: 22,
  mass: 1,
};

/** Input lock while the rim spring settles. */
export const HOME_PLATE_WHEEL_LOCK_MS = 640;

/** Hero plate rim rotation per category step (matches dish arc travel). */
export const HOME_PLATE_RIM_STEP_DEG = 14;

const INSTANT: Transition = { duration: 0 };

/** Dish wheel transition — z-index snaps so layers do not tween. */
export function plateWheelTransition(playMotion: boolean): Transition {
  if (!playMotion) {
    return INSTANT;
  }

  return {
    ...HOME_PLATE_WHEEL_SPRING,
    zIndex: { duration: 0 },
  };
}
