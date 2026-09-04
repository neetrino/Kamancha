import type { Transition } from "motion/react";

/**
 * Shared dish / rim timing — tween (not soft spring) so rotate+x stay on arc
 * without overshoot that reads as crooked.
 */
export const HOME_PLATE_WHEEL_DURATION_S = 0.84;

export const HOME_PLATE_WHEEL_EASE: [number, number, number, number] = [
  0.33, 1, 0.32, 1,
];

export const HOME_PLATE_WHEEL_TRANSITION: Transition = {
  type: "tween",
  duration: HOME_PLATE_WHEEL_DURATION_S,
  ease: HOME_PLATE_WHEEL_EASE,
};

/** @deprecated Alias — rim + dishes share the same tween. */
export const HOME_PLATE_WHEEL_SPRING = HOME_PLATE_WHEEL_TRANSITION;

/** Input lock while the wheel tween finishes. */
export const HOME_PLATE_WHEEL_LOCK_MS = Math.ceil(
  HOME_PLATE_WHEEL_DURATION_S * 1000 + 40,
);

/** Hero plate rim rotation per category step (matches dish arc travel). */
export const HOME_PLATE_RIM_STEP_DEG = 13;

const INSTANT: Transition = { duration: 0 };

/** Dish wheel transition — z-index snaps so layers do not tween. */
export function plateWheelTransition(playMotion: boolean): Transition {
  if (!playMotion) {
    return INSTANT;
  }

  return {
    ...HOME_PLATE_WHEEL_TRANSITION,
    zIndex: { duration: 0 },
  };
}
