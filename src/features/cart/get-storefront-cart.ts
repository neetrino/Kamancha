import "server-only";

import {
  getCartWithItems,
  type CartItemModifierView,
} from "@/features/cart/cart";
import { cartLineUnitAmount } from "@/features/cart/domain/line-price";
import {
  getGroupCartOverlayLines,
  type GroupCartOverlayLine,
} from "@/features/group-orders/application/cart-overlay";
import type { VariantSnapshot } from "@/features/products/application/load-variant-snapshots";
import {
  pricedCartLineInput,
  resolveProductPrices,
} from "@/features/promotions/application/resolve-product-prices";

export type StorefrontCartLine = {
  id: string;
  quantity: number;
  product: GroupCartOverlayLine["product"];
  modifiers: CartItemModifierView[];
  unitAmount: number;
  variant: VariantSnapshot | null;
  attributeId: string | null;
};

export type StorefrontCart = {
  source: "personal" | "group";
  inviteToken: string | null;
  canEdit: boolean;
  items: StorefrontCartLine[];
};

/** Personal cart, or the current participant's group lines while collecting. */
export async function getStorefrontCart(): Promise<StorefrontCart> {
  const overlay = await getGroupCartOverlayLines();
  if (overlay) {
    return fromGroupOverlay(
      overlay.overlay.inviteToken,
      overlay.overlay.canEditItems,
      overlay.items,
    );
  }
  return fromPersonalCart();
}

async function fromGroupOverlay(
  inviteToken: string,
  canEdit: boolean,
  lines: GroupCartOverlayLine[],
): Promise<StorefrontCart> {
  const prices = await resolveProductPrices(
    lines.map((line) =>
      pricedCartLineInput({
        itemId: line.id,
        productId: line.product.id,
        productPriceAmount: line.product.priceAmount,
        compareAtAmount: line.product.compareAtAmount,
        variantPriceAmount: line.variant?.priceAmount ?? null,
      }),
    ),
  );

  return {
    source: "group",
    inviteToken,
    canEdit,
    items: lines.map((line) => {
      const fallback = line.variant?.priceAmount ?? line.product.priceAmount;
      const base = prices.get(line.id)?.unitAmount ?? fallback;
      return {
        id: line.id,
        quantity: line.quantity,
        product: line.product,
        modifiers: line.modifiers,
        variant: line.variant,
        attributeId: line.attributeId,
        unitAmount: cartLineUnitAmount(base, line.modifiers),
      };
    }),
  };
}

async function fromPersonalCart(): Promise<StorefrontCart> {
  const { items } = await getCartWithItems();
  const prices = await resolveProductPrices(
    items.map(({ item, product, variant }) =>
      pricedCartLineInput({
        itemId: item.id,
        productId: product.id,
        productPriceAmount: product.priceAmount,
        compareAtAmount: product.compareAtAmount,
        variantPriceAmount: variant?.priceAmount ?? null,
      }),
    ),
  );

  return {
    source: "personal",
    inviteToken: null,
    canEdit: true,
    items: items.map(({ item, product, modifiers, variant }) => {
      const fallback = variant?.priceAmount ?? product.priceAmount;
      const base = prices.get(item.id)?.unitAmount ?? fallback;
      return {
        id: item.id,
        quantity: item.quantity,
        product,
        modifiers,
        variant,
        attributeId: item.attributeId,
        unitAmount: cartLineUnitAmount(base, modifiers),
      };
    }),
  };
}
