/** Checkout visual tokens shared across form sections. */

export const CHECKOUT_SECTION_TITLE_CLASS =
  "relative z-[2] mb-6 font-big-fat-boii text-xl font-normal tracking-wide text-white uppercase transition-colors duration-300";

/** Invalid feedback: section title turns red and shakes briefly. */
export const CHECKOUT_TITLE_INVALID_CLASS =
  "animate-checkout-field-shake !text-red-500";

/** How long invalid title red + shake stay visible before clearing. */
export const CHECKOUT_INVALID_FEEDBACK_MS = 1000;
