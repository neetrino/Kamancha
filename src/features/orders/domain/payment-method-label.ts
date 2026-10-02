/** Display label for stored payment method / provider codes. */
export function paymentMethodLabel(method: string): string {
  const normalized = method.toUpperCase();
  if (normalized === "COD" || normalized === "CASH" || normalized === "CASH_ON_DELIVERY") {
    return "Cash";
  }
  if (normalized === "CARD") {
    return "Card";
  }
  if (normalized === "IDRAM") {
    return "Idram";
  }
  if (normalized === "ARCA") {
    return "ArCa";
  }
  if (normalized === "TERMINAL") {
    return "Terminal";
  }
  return method;
}
