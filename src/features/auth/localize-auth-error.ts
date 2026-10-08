import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

const PASSWORD_MIN_MESSAGE = "Password must be at least 6 characters.";
const PASSWORD_LETTER_MESSAGE = "Password must contain a letter.";
const PASSWORD_DIGIT_MESSAGE = "Password must contain a digit.";

/** Maps known schema messages to the active locale. */
export function localizeAuthError(
  locale: Locale,
  message: string | undefined,
  fallback: string,
): string {
  const copy = getDictionary(locale).auth;
  if (message === PASSWORD_MIN_MESSAGE) return copy.passwordMinLength;
  if (message === PASSWORD_LETTER_MESSAGE) return copy.passwordLetter;
  if (message === PASSWORD_DIGIT_MESSAGE) return copy.passwordDigit;
  return message ?? fallback;
}
