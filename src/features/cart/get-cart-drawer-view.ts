import "server-only";

import {
  getStorefrontCart,
  type StorefrontCartLine,
} from "@/features/cart/get-storefront-cart";
import { buildInvitePath } from "@/features/group-orders/application/money";
import { loadPrimaryProductImageUrls } from "@/features/products/application/product-primary-images";
import type { Locale } from "@/lib/i18n/config";
import { getCheckoutRateSnapshot } from "@/lib/fx/service";
import { convertAmount } from "@/lib/money/convert";
import type { Currency } from "@/lib/money/currency";
import { defaultCurrency } from "@/lib/money/currency";
import { formatMoneyAmount } from "@/lib/money/format";

export type CartDrawerItemView = {
  id: string;
  title: string;
  href: string;
  quantity: number;
  imageUrl: string | null;
  unitPriceFormatted: string;
  lineTotalFormatted: string;
  modifierSummary: string | null;
};

export type CartDrawerView = {
  itemCount: number;
  items: CartDrawerItemView[];
  subtotalFormatted: string;
  shippingFormatted: string;
  totalFormatted: string;
  checkoutHref: string;
  canEdit: boolean;
  source: "personal" | "group";
};

function formatConvertedAmount(
  baseAmountAmd: number,
  rate: string,
  currency: Currency,
  locale: Locale,
): string {
  const converted = convertAmount(
    baseAmountAmd,
    rate,
    defaultCurrency,
    currency,
  );
  return formatMoneyAmount(converted.amount, currency, locale);
}

/** Builds storefront cart-drawer display data for the active bag. */
export async function getCartDrawerView(
  locale: Locale,
  currency: Currency,
): Promise<CartDrawerView> {
  const bag = await getStorefrontCart();
  const [images, quote] = await Promise.all([
    loadPrimaryProductImageUrls(bag.items.map((line) => line.product.id)),
    getCheckoutRateSnapshot(currency),
  ]);

  const items: CartDrawerItemView[] = [];
  let subtotalBase = 0;

  for (const line of bag.items) {
    items.push(toDrawerItem(line, locale, currency, quote.rate, images));
    subtotalBase += line.quantity * line.unitAmount;
  }

  const subtotalFormatted = formatConvertedAmount(
    subtotalBase,
    quote.rate,
    currency,
    locale,
  );
  const checkoutHref = bag.inviteToken
    ? buildInvitePath(locale, bag.inviteToken)
    : `/${locale}/checkout`;

  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
    subtotalFormatted,
    shippingFormatted: formatMoneyAmount(0, currency, locale),
    totalFormatted: subtotalFormatted,
    checkoutHref,
    canEdit: bag.canEdit,
    source: bag.source,
  };
}

function toDrawerItem(
  line: StorefrontCartLine,
  locale: Locale,
  currency: Currency,
  rate: string,
  images: Map<string, string>,
): CartDrawerItemView {
  const translation =
    line.product.translations[locale] ?? line.product.translations.hy;
  const slug =
    translation?.slug ??
    line.product.translations.hy?.slug ??
    line.product.translations.en?.slug ??
    line.product.translations.ru?.slug ??
    line.product.id;
  const additions = line.modifiers.filter((row) => row.kind === "ADDITION");
  const exceptions = line.modifiers.filter((row) => row.kind === "EXCEPTION");

  return {
    id: line.id,
    title: translation?.title ?? line.product.sku,
    href: `/${locale}/products/${slug}`,
    quantity: line.quantity,
    imageUrl: images.get(line.product.id) ?? null,
    unitPriceFormatted: formatConvertedAmount(
      line.unitAmount,
      rate,
      currency,
      locale,
    ),
    lineTotalFormatted: formatConvertedAmount(
      line.unitAmount * line.quantity,
      rate,
      currency,
      locale,
    ),
    modifierSummary: formatModifierSummary(additions, exceptions),
  };
}

function formatModifierSummary(
  additions: Array<{ name: string }>,
  exceptions: Array<{ name: string }>,
): string | null {
  const parts: string[] = [];
  if (additions.length > 0) {
    parts.push(`+ ${additions.map((row) => row.name).join(", ")}`);
  }
  if (exceptions.length > 0) {
    parts.push(`− ${exceptions.map((row) => row.name).join(", ")}`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}
