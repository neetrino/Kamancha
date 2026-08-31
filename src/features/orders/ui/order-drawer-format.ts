import { isCurrency, currencySymbols } from "@/lib/money/currency";

/** Formats admin money as "2,334 ֏" style for the order drawer. */
export function formatOrderDrawerMoney(
  amount: number,
  currency: string,
): string {
  const symbol = isCurrency(currency) ? currencySymbols[currency] : currency;
  return `${amount.toLocaleString("en-US")} ${symbol}`;
}
