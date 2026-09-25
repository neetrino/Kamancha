"use server";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/client";
import {
  cartItemModifiers,
  cartItems,
  carts,
  productModifiers,
  productVariants,
  products,
} from "@/db/schema";
import {
  getGuestCartToken,
  hashGuestToken,
  peekGuestCartToken,
} from "@/features/cart/guest-token";
import { resolveCartAttribute } from "@/features/attributes/application/library";
import { buildLineSelectionKey } from "@/features/products/domain/modifier-selection";
import { resolveSelectedModifiersForProduct } from "@/features/products/application/product-modifiers";
import type { ProductModifierRow } from "@/features/products/types/modifiers";
import { getGroupCartOverlayItemCount } from "@/features/group-orders/application/cart-overlay";
import {
  loadVariantSnapshots,
  type VariantSnapshot,
} from "@/features/products/application/load-variant-snapshots";
import { getCurrentUser } from "@/lib/auth/session";
import { createId } from "@/lib/id";

type CartRow = typeof carts.$inferSelect;

export type CartItemModifierView = {
  id: string;
  kind: "ADDITION" | "EXCEPTION";
  name: string;
  priceAmount: number;
};

export type CartItemWithProduct = {
  item: typeof cartItems.$inferSelect;
  product: typeof products.$inferSelect;
  modifiers: CartItemModifierView[];
  variant: VariantSnapshot | null;
};

async function getCartOwnerForWrite(): Promise<{
  userId?: string;
  guestTokenHash?: string;
}> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id };
  return { guestTokenHash: hashGuestToken(await getGuestCartToken()) };
}

/** Owner for read paths — never creates a guest cookie or cart row. */
async function getCartOwnerForRead(): Promise<{
  userId?: string;
  guestTokenHash?: string;
} | null> {
  const user = await getCurrentUser();
  if (user) return { userId: user.id };

  const token = await peekGuestCartToken();
  if (!token) return null;

  return { guestTokenHash: hashGuestToken(token) };
}

async function findActiveCart(
  owner: { userId?: string; guestTokenHash?: string },
): Promise<CartRow | null> {
  const ownerCondition = owner.userId
    ? eq(carts.userId, owner.userId)
    : eq(carts.guestTokenHash, owner.guestTokenHash!);

  const [existing] = await getDb()
    .select()
    .from(carts)
    .where(and(eq(carts.status, "ACTIVE"), ownerCondition))
    .limit(1);

  return existing ?? null;
}

/** Returns the caller's active durable cart, creating it when absent. */
export async function getOrCreateCart(): Promise<CartRow> {
  const owner = await getCartOwnerForWrite();
  const existing = await findActiveCart(owner);
  if (existing) return existing;

  const [created] = await getDb()
    .insert(carts)
    .values({ id: createId(), ...owner })
    .returning();
  if (!created) throw new Error("Unable to create cart.");
  return created;
}

async function loadModifiersForCartItems(
  itemIds: string[],
): Promise<Map<string, CartItemModifierView[]>> {
  const map = new Map<string, CartItemModifierView[]>();
  if (itemIds.length === 0) return map;

  const rows = await getDb()
    .select({
      cartItemId: cartItemModifiers.cartItemId,
      id: productModifiers.id,
      kind: productModifiers.kind,
      name: productModifiers.name,
      priceAmount: productModifiers.priceAmount,
    })
    .from(cartItemModifiers)
    .innerJoin(
      productModifiers,
      eq(cartItemModifiers.modifierId, productModifiers.id),
    )
    .where(inArray(cartItemModifiers.cartItemId, itemIds));

  for (const row of rows) {
    const entry = map.get(row.cartItemId) ?? [];
    entry.push({
      id: row.id,
      kind: row.kind,
      name: row.name,
      priceAmount: row.priceAmount,
    });
    map.set(row.cartItemId, entry);
  }

  return map;
}

/** Loads cart lines without creating a cart or guest cookie.
 * Used by header, cart page, and checkout reads.
 */
export async function getCartWithItems(): Promise<{
  cart: CartRow | null;
  items: CartItemWithProduct[];
}> {
  const owner = await getCartOwnerForRead();
  if (!owner) {
    return { cart: null, items: [] };
  }

  const cart = await findActiveCart(owner);
  if (!cart) {
    return { cart: null, items: [] };
  }

  const rows = await getDb()
    .select({ item: cartItems, product: products })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  const modifiersByItem = await loadModifiersForCartItems(
    rows.map((row) => row.item.id),
  );
  const variantsById = await loadVariantSnapshots(
    rows.flatMap((row) => (row.item.variantId ? [row.item.variantId] : [])),
  );

  return {
    cart,
    items: rows.map((row) => ({
      item: row.item,
      product: row.product,
      modifiers: modifiersByItem.get(row.item.id) ?? [],
      variant: row.item.variantId
        ? (variantsById.get(row.item.variantId) ?? null)
        : null,
    })),
  };
}

/** Cheap badge count for the header — no cart creation, no line enrichment. */
export async function getCartItemCount(): Promise<number> {
  const overlayCount = await getGroupCartOverlayItemCount();
  if (overlayCount != null) {
    return overlayCount;
  }
  const owner = await getCartOwnerForRead();
  if (!owner) {
    return 0;
  }

  const cart = await findActiveCart(owner);
  if (!cart) {
    return 0;
  }

  const [row] = await getDb()
    .select({
      total: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int`,
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));

  return row?.total ?? 0;
}

export type AddToCartOptions = {
  modifierIds?: ReadonlyArray<string>;
  variantId?: string;
  attributeId?: string;
};

async function resolveSellableStock(
  productId: string,
  variantId: string | undefined,
): Promise<{ stock: number; variantId: string | null } | null> {
  const [product] = await getDb()
    .select({
      id: products.id,
      stock: products.stockOnHand,
      status: products.status,
      kind: products.kind,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product || product.status !== "ACTIVE") return null;

  if (product.kind === "SIMPLE") {
    if (variantId) return null;
    if (product.stock < 1) return null;
    return { stock: product.stock, variantId: null };
  }

  if (!variantId) return null;
  const [variant] = await getDb()
    .select({
      id: productVariants.id,
      stock: productVariants.stockOnHand,
    })
    .from(productVariants)
    .where(
      and(
        eq(productVariants.id, variantId),
        eq(productVariants.productId, productId),
      ),
    )
    .limit(1);
  if (!variant || variant.stock < 1) return null;
  return { stock: variant.stock, variantId: variant.id };
}

export async function addToCart(
  productId: string,
  quantity = 1,
  options: AddToCartOptions = {},
): Promise<void> {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Invalid quantity.");
  }

  const cart = await getOrCreateCart();
  const sellable = await resolveSellableStock(productId, options.variantId);
  if (!sellable) {
    throw new Error("Product unavailable.");
  }

  const resolved = await resolveSelectedModifiersForProduct(
    productId,
    options.modifierIds ?? [],
  );
  if (!resolved.ok) {
    throw new Error(resolved.error);
  }

  const chosen = await resolveCartAttribute(productId, options.attributeId);
  if (!chosen.ok) {
    throw new Error(chosen.error);
  }

  const selectionKey = buildLineSelectionKey(
    resolved.modifiers.map((modifier) => modifier.id),
    chosen.attributeId,
  );
  const addQty = Math.min(quantity, sellable.stock);
  const variantMatch = sellable.variantId
    ? eq(cartItems.variantId, sellable.variantId)
    : isNull(cartItems.variantId);
  const attributeMatch = chosen.attributeId
    ? eq(cartItems.attributeId, chosen.attributeId)
    : isNull(cartItems.attributeId);

  const [existing] = await getDb()
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productId, productId),
        eq(cartItems.selectionKey, selectionKey),
        variantMatch,
        attributeMatch,
      ),
    )
    .limit(1);

  if (existing) {
    await getDb()
      .update(cartItems)
      .set({
        quantity: Math.min(existing.quantity + addQty, sellable.stock),
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, existing.id));
  } else {
    const itemId = createId();
    await getDb().insert(cartItems).values({
      id: itemId,
      cartId: cart.id,
      productId,
      variantId: sellable.variantId,
      attributeId: chosen.attributeId,
      selectionKey,
      quantity: addQty,
    });
    await insertCartItemModifiers(itemId, resolved.modifiers);
  }

  await revalidateCartPaths();
}

async function insertCartItemModifiers(
  cartItemId: string,
  modifiers: ReadonlyArray<ProductModifierRow>,
): Promise<void> {
  if (modifiers.length === 0) return;
  await getDb().insert(cartItemModifiers).values(
    modifiers.map((modifier) => ({
      id: createId(),
      cartItemId,
      modifierId: modifier.id,
    })),
  );
}

export async function updateQuantity(
  itemId: string,
  quantity: number,
): Promise<void> {
  const cart = await getOrCreateCart();
  if (!Number.isInteger(quantity) || quantity < 1) {
    await removeItem(itemId);
    return;
  }
  await getDb()
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
  await revalidateCartPaths();
}

export async function removeItem(itemId: string): Promise<void> {
  const cart = await getOrCreateCart();
  await getDb()
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
  await revalidateCartPaths();
}

/** Invalidates cart/checkout pages after durable cart mutations.
 * Header badges stay local — skip layout revalidate for snappy add-to-cart.
 */
export async function revalidateCartPaths(): Promise<void> {
  revalidatePath("/[locale]/cart", "page");
  revalidatePath("/[locale]/checkout", "page");
}
