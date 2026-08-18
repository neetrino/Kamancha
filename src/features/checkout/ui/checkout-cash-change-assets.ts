/** Cash-change picker layout and selection types. */

export const CASH_CHANGE_NONE = "none" as const;

export type CashChangeSelection = number | typeof CASH_CHANGE_NONE;

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
