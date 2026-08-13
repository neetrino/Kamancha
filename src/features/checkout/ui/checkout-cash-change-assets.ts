/** Bundled AMD banknote art and cash-change picker layout (MaMarie). */

export const CASH_CHANGE_NONE = "none" as const;

export type CashChangeSelection = number | typeof CASH_CHANGE_NONE;

export const CASH_CHANGE_DENOMINATIONS_AMD = [
  2000, 5000, 10_000, 20_000, 50_000, 100_000,
] as const;

export const CASH_CHANGE_BANKNOTE_SRC: Record<
  (typeof CASH_CHANGE_DENOMINATIONS_AMD)[number],
  string
> = {
  2000: "/assets/payments/amd/2000.webp",
  5000: "/assets/payments/amd/5000.webp",
  10_000: "/assets/payments/amd/10000.webp",
  20_000: "/assets/payments/amd/20000.webp",
  50_000: "/assets/payments/amd/50000.webp",
  100_000: "/assets/payments/amd/100000.webp",
};

export const CHECKOUT_CASH_CHANGE_SECTION_CLASS =
  "liquid-glass isolate overflow-hidden rounded-[18px] p-4 sm:p-5";
export const CHECKOUT_CASH_CHANGE_TITLE_CLASS =
  "text-base font-bold tracking-wide text-gray-900";
export const CHECKOUT_CASH_CHANGE_HINT_CLASS =
  "mt-2 text-sm leading-snug text-gray-600";
export const CHECKOUT_CASH_CHANGE_GRID_CLASS =
  "mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3";
export const CHECKOUT_CASH_CHANGE_OPTION_BASE_CLASS =
  "liquid-glass isolate flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-[18px] outline-none transition-all [-webkit-tap-highlight-color:transparent] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest disabled:cursor-not-allowed disabled:opacity-50";
export const CHECKOUT_CASH_CHANGE_OPTION_SELECTED_CLASS =
  "ring-2 ring-inset ring-brand-forest";
export const CHECKOUT_CASH_CHANGE_OPTION_DEFAULT_CLASS =
  "hover:brightness-[1.04]";
export const CHECKOUT_CASH_CHANGE_NONE_CLASS =
  "aspect-[2/1] px-2 text-center text-base font-semibold leading-snug text-brand-forest sm:text-lg";
export const CHECKOUT_CASH_CHANGE_NOTE_BUTTON_CLASS = "relative aspect-[2/1] p-0";
export const CHECKOUT_CASH_CHANGE_NOTE_IMAGE_CLASS = "object-cover object-center";

/** Prefers an uploaded admin image, then the bundled note for that amount. */
export function resolveCashChangeImageUrl(
  amount: number,
  imageUrl: string | null,
): string | null {
  if (imageUrl != null && imageUrl.length > 0) {
    return imageUrl;
  }
  return CASH_CHANGE_BANKNOTE_SRC[amount as keyof typeof CASH_CHANGE_BANKNOTE_SRC] ?? null;
}
