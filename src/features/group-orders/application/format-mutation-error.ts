import { SPEND_LIMIT_EXCEEDED_ERROR } from "@/features/group-orders/domain/spend-limit";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { formatMoneyAmount } from "@/lib/money/format";

type GroupOrderErrorPayload = {
  error: string;
  limitAmount?: number;
  subtotalAmount?: number;
};

/** Maps known mutation codes to storefront copy; unknown strings pass through. */
export function formatGroupOrderMutationError(
  result: GroupOrderErrorPayload,
  locale: Locale,
): string {
  if (
    result.error === SPEND_LIMIT_EXCEEDED_ERROR &&
    result.limitAmount != null
  ) {
    const subtotal = result.subtotalAmount ?? result.limitAmount;
    return getDictionary(locale).groupOrder.spendLimitExceeded
      .replace("{limit}", formatMoneyAmount(result.limitAmount, "AMD", locale))
      .replace("{subtotal}", formatMoneyAmount(subtotal, "AMD", locale));
  }
  return result.error;
}

/** Localizes a failed group-order mutation for the current request locale. */
export async function localizeGroupOrderMutationError(
  result: GroupOrderErrorPayload,
): Promise<string> {
  const locale = await getRequestLocale();
  return formatGroupOrderMutationError(result, locale);
}
