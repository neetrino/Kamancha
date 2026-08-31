import { isCurrency, currencySymbols } from "@/lib/money/currency";

const NBSP = "\u00A0";

/** Formats admin money as "2 334 ֏" style for the order drawer. */
export function formatOrderDrawerMoney(
  amount: number,
  currency: string,
): string {
  const symbol = isCurrency(currency) ? currencySymbols[currency] : currency;
  const sign = amount < 0 ? "-" : "";
  const absolute = Math.abs(Math.round(amount));
  const grouped = String(absolute).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${sign}${grouped} ${symbol}`;
}
