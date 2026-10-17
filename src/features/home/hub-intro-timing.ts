import type { Transition } from "motion/react";

/** Hands stay on screen before they leave. */
export const HUB_INTRO_HOLD_MS = 650;

/** Hands slide off after the hold. */
export const HUB_INTRO_DONE_MS = 800;

/** Mobile hub: start the navbar drop this many ms before intro `done`. */
export const HUB_INTRO_NAV_LEAD_MS = 250;

export const HUB_MOBILE_NAV_QUERY = "(max-width: 1279px)";

/** Delivery home: navbar drop after arriving from the hub. */
export const HOME_NAV_REVEAL_MS = 200;

/** Shared spring for hands, cards, and hub navbar drop. */
export const HUB_INTRO_SPRING: Transition = {
  type: "spring",
  stiffness: 48,
  damping: 18,
  mass: 1.05,
};
