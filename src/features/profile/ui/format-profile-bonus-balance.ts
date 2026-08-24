import type { Locale } from "@/lib/i18n/config";
import { formatMoneyAmount } from "@/lib/money/format";

/** Profile sidebar bonus line — `Bonuses: 1 010 ֏`. */
export function formatProfileBonusBalance(
  balance: number,
  locale: Locale,
  bonusesLabel: string,
): string {
  return `${bonusesLabel}: ${formatMoneyAmount(balance, "AMD", locale)}`;
}
