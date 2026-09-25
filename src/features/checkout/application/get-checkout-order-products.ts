import "server-only";

import type { CartItemWithProduct } from "@/features/cart/cart";
import { cartLineUnitAmount } from "@/features/cart/domain/line-price";
import type { CheckoutOrderProduct } from "@/features/checkout/ui/checkout-order-product";
import { variantLabel } from "@/features/products/application/load-variant-snapshots";
import { loadPrimaryProductImageUrls } from "@/features/products/application/product-primary-images";
import { mediaPublicUrl } from "@/lib/media/public-url";
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

  return rows.map(({ item, product, modifiers, variant }) => {
    const translation =
      product.translations[locale] ?? product.translations.hy;
    const optionLabel = variantLabel(variant, locale);
    const title = translation?.title ?? product.sku;
    const variantImage = variant?.imageObjectKey
      ? mediaPublicUrl(variant.imageObjectKey)
      : null;
    const parts: string[] = [];
    const additions = modifiers.filter((row) => row.kind === "ADDITION");
    const exceptions = modifiers.filter((row) => row.kind === "EXCEPTION");
    if (additions.length > 0) {
      parts.push(`+ ${additions.map((row) => row.name).join(", ")}`);
    }
    if (exceptions.length > 0) {
      parts.push(`− ${exceptions.map((row) => row.name).join(", ")}`);
    }
    const fallback = variant?.priceAmount ?? product.priceAmount;
    const unitAmount = prices.get(item.id)?.unitAmount ?? fallback;
    return {
      id: item.id,
      title: optionLabel ? `${title} · ${optionLabel}` : title,
      quantity: item.quantity,
      imageUrl: variantImage ?? images.get(product.id) ?? null,
      modifierSummary: parts.length > 0 ? parts.join(" · ") : null,
      lineTotalAmount: item.quantity * cartLineUnitAmount(unitAmount, modifiers),
    };
  });
}
