"use server";

import {
  getCheckoutFormView,
  type GetCheckoutFormViewResult,
} from "@/features/checkout/application/get-checkout-form-view";
import { isLocale, type Locale } from "@/lib/i18n/config";

/** On-demand checkout payload for the mobile cart sheet. */
export async function loadCheckoutFormViewAction(
  locale: Locale,
): Promise<GetCheckoutFormViewResult> {
  if (!isLocale(locale)) {
    return { ok: false, redirectTo: "/" };
  }
  return getCheckoutFormView(locale);
}
