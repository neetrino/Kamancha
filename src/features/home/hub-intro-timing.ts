import type { Transition } from "motion/react";

/** Hands stay on screen before they leave. */
export const HUB_INTRO_HOLD_MS = 650;

/** Hands slide off after the hold. */
export const HUB_INTRO_DONE_MS = 800;

/** Delivery home: navbar drops with the hero wordmark. */
export const HOME_NAV_REVEAL_MS = 450;

/** Shared spring for hands, cards, and hub navbar drop. */
export const HUB_INTRO_SPRING: Transition = {
  type: "spring",
  stiffness: 48,
  damping: 18,
  mass: 1.05,
};
