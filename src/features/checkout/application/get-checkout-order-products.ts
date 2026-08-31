import "server-only";

import type { CartItemWithProduct } from "@/features/cart/cart";
import { cartLineUnitAmount } from "@/features/cart/domain/line-price";
import type { CheckoutOrderProduct } from "@/features/checkout/ui/checkout-order-product";
import { loadPrimaryProductImageUrls } from "@/features/products/application/product-primary-images";
import type { ResolvedCatalogPrice } from "@/features/promotions/domain/resolve-automatic-discount";
import type { Locale } from "@/lib/i18n/config";

export type { CheckoutOrderProduct };

/** Builds checkout “products in your order” display rows from cart lines. */
export async function getCheckoutOrderProducts(
  locale: Locale,
  rows: CartItemWithProduct[],
  prices: ReadonlyMap<string, ResolvedCatalogPrice>,
): Promise<CheckoutOrderProduct[]> {
  const images = await loadPrimaryProductImageUrls(
    rows.map(({ product }) => product.id),
  );

  return rows.map(({ item, product, modifiers }) => {
    const translation =
      product.translations[locale] ?? product.translations.hy;
    const parts: string[] = [];
    const additions = modifiers.filter((row) => row.kind === "ADDITION");
    const exceptions = modifiers.filter((row) => row.kind === "EXCEPTION");
    if (additions.length > 0) {
      parts.push(`+ ${additions.map((row) => row.name).join(", ")}`);
    }
    if (exceptions.length > 0) {
      parts.push(`− ${exceptions.map((row) => row.name).join(", ")}`);
    }
    const unitAmount =
      prices.get(product.id)?.unitAmount ?? product.priceAmount;
    return {
      id: item.id,
      title: translation?.title ?? product.sku,
      quantity: item.quantity,
      imageUrl: images.get(product.id) ?? null,
      modifierSummary: parts.length > 0 ? parts.join(" · ") : null,
      lineTotalAmount: item.quantity * cartLineUnitAmount(unitAmount, modifiers),
    };
  });
}
