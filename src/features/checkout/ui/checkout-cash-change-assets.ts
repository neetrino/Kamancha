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
  "overflow-hidden rounded-[18px] bg-white p-4 sm:p-5";
export const CHECKOUT_CASH_CHANGE_TITLE_CLASS =
  "font-big-fat-boii text-base font-normal tracking-wide text-black uppercase";
export const CHECKOUT_CASH_CHANGE_HINT_CLASS =
  "mt-2 text-sm leading-snug text-gray-600";
export const CHECKOUT_CASH_CHANGE_GRID_CLASS =
  "mt-4 grid grid-cols-4 gap-2 sm:gap-2.5";
export const CHECKOUT_CASH_CHANGE_OPTION_BASE_CLASS =
  "relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-[18px] bg-white transition-colors [-webkit-tap-highlight-color:transparent] disabled:cursor-not-allowed disabled:opacity-50";
export const CHECKOUT_CASH_CHANGE_OPTION_SELECTED_CLASS =
  "outline outline-[3px] outline-offset-2 outline-[#163318]";
export const CHECKOUT_CASH_CHANGE_OPTION_DEFAULT_CLASS =
  "outline-none hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-forest";
export const CHECKOUT_CASH_CHANGE_NONE_CLASS =
  "aspect-[2/1] px-1.5 text-center font-big-fat-boii text-[11px] font-normal leading-snug tracking-wide text-brand-forest uppercase sm:px-2 sm:text-sm";
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
