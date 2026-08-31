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
import { resolveProductPrices } from "@/features/promotions/application/resolve-product-prices";

export type StorefrontCartLine = {
  id: string;
  quantity: number;
  product: GroupCartOverlayLine["product"];
  modifiers: CartItemModifierView[];
  unitAmount: number;
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
    lines.map((line) => ({
      id: line.product.id,
      priceAmount: line.product.priceAmount,
      compareAtAmount: line.product.compareAtAmount,
    })),
  );

  return {
    source: "group",
    inviteToken,
    canEdit,
    items: lines.map((line) => {
      const base =
        prices.get(line.product.id)?.unitAmount ?? line.product.priceAmount;
      return {
        id: line.id,
        quantity: line.quantity,
        product: line.product,
        modifiers: line.modifiers,
        unitAmount: cartLineUnitAmount(base, line.modifiers),
      };
    }),
  };
}

async function fromPersonalCart(): Promise<StorefrontCart> {
  const { items } = await getCartWithItems();
  const prices = await resolveProductPrices(
    items.map(({ product }) => ({
      id: product.id,
      priceAmount: product.priceAmount,
      compareAtAmount: product.compareAtAmount,
    })),
  );

  return {
    source: "personal",
    inviteToken: null,
    canEdit: true,
    items: items.map(({ item, product, modifiers }) => {
      const base = prices.get(product.id)?.unitAmount ?? product.priceAmount;
      return {
        id: item.id,
        quantity: item.quantity,
        product,
        modifiers,
        unitAmount: cartLineUnitAmount(base, modifiers),
      };
    }),
  };
}
