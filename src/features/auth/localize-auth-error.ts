import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

const PASSWORD_DIGIT_MESSAGE = "Password must contain a digit.";

/** Maps known schema messages to the active locale. */
export function localizeAuthError(
  locale: Locale,
  message: string | undefined,
  fallback: string,
): string {
  if (message === PASSWORD_DIGIT_MESSAGE) {
    return getDictionary(locale).auth.passwordDigit;
  }
  return message ?? fallback;
}
