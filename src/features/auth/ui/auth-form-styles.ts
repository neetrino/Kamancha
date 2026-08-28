/** Shared Kamancha auth field styles — same system as ContactForm (Figma 244 / 253). */

export const AUTH_FIELD_CLASS =
  "h-12 w-full rounded-[20px] border-0 bg-[rgba(97,135,98,0.13)] px-[13px] text-sm text-gray-900 outline-none transition placeholder:text-[#717182] focus:ring-2 focus:ring-brand-forest/30 disabled:opacity-60";

export const AUTH_FIELD_INVALID_CLASS =
  "ring-2 ring-red-500 focus:ring-red-500";

export const AUTH_LABEL_CLASS =
  "block text-sm font-medium tracking-[-0.15px] text-[#0a0a0a]";

export const AUTH_LINK_CLASS =
  "font-medium text-brand-forest underline-offset-2 hover:underline";

/** Footer switch link (Մուտք / Ստեղծել հաշիվ) — slightly larger + bold. */
export const AUTH_SWITCH_LINK_CLASS =
  "text-base font-bold text-brand-forest underline-offset-2 hover:underline";

/** Submit pill label — slightly larger + bold on auth forms. */
export const AUTH_SUBMIT_PILL_CLASS =
  "max-w-none sm:max-w-none [&_span.font-big-fat-boii]:text-[20px] [&_span.font-big-fat-boii]:font-bold sm:[&_span.font-big-fat-boii]:text-[22px]";

export const AUTH_ERROR_CLASS =
  "w-full px-4 pt-3 text-sm text-red-600 sm:px-5";

export const AUTH_STATUS_CLASS =
  "w-full px-4 pt-3 text-sm text-brand-forest sm:px-5";

export function authFieldClassName(invalid = false): string {
  return invalid
    ? `${AUTH_FIELD_CLASS} ${AUTH_FIELD_INVALID_CLASS}`
    : AUTH_FIELD_CLASS;
}
