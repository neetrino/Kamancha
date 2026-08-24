/** Shared Kamancha auth field styles — same system as ContactForm (Figma 244 / 253). */

export const AUTH_FIELD_CLASS =
  "h-12 w-full rounded-[20px] border-0 bg-[rgba(97,135,98,0.13)] px-[13px] text-sm text-gray-900 outline-none transition placeholder:text-[#717182] focus:ring-2 focus:ring-brand-forest/30 disabled:opacity-60";

export const AUTH_FIELD_INVALID_CLASS =
  "ring-2 ring-red-500 focus:ring-red-500";

export const AUTH_LABEL_CLASS =
  "block text-sm font-medium tracking-[-0.15px] text-[#0a0a0a]";

export const AUTH_LINK_CLASS =
  "font-medium text-brand-forest underline-offset-2 hover:underline";

export const AUTH_ERROR_CLASS =
  "w-full px-4 pt-3 text-sm text-red-600 sm:px-5";

export const AUTH_STATUS_CLASS =
  "w-full px-4 pt-3 text-sm text-brand-forest sm:px-5";

export function authFieldClassName(invalid = false): string {
  return invalid
    ? `${AUTH_FIELD_CLASS} ${AUTH_FIELD_INVALID_CLASS}`
    : AUTH_FIELD_CLASS;
}
