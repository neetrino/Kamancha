import "server-only";

import { revalidatePath } from "next/cache";

import {
  addToCart,
  getCartWithItems,
  removeItem,
  updateQuantity,
} from "@/features/cart/cart";
import {
  isQuickAddLine,
  MAX_PLAIN_LINE_QUANTITY,
  type PlainCartLine,
  type PlainCartLineResult,
} from "@/features/cart/domain/plain-line";
import { getGroupCartOverlayLines } from "@/features/group-orders/application/cart-overlay";
import { localizeGroupOrderMutationError } from "@/features/group-orders/application/format-mutation-error";
import {
  addGroupOrderItem,
  removeGroupOrderItem,
  updateGroupOrderItemQuantity,
} from "@/features/group-orders/application/items";

function revalidateGroupBag(inviteToken: string): void {
  revalidatePath(`/[locale]/group-orders/${inviteToken}`, "page");
  revalidatePath("/[locale]/cart", "page");
  revalidatePath("/", "layout");
}

function uniqueByProduct(lines: PlainCartLine[]): PlainCartLine[] {
  const seen = new Set<string>();
  const result: PlainCartLine[] = [];
  for (const line of lines) {
    if (seen.has(line.productId)) continue;
    seen.add(line.productId);
    result.push(line);
  }
  return result;
}

function invalidQuantity(quantity: number): string | null {
  if (
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    quantity > MAX_PLAIN_LINE_QUANTITY
  ) {
    return "Invalid quantity.";
  }
  return null;
}

/** Plain product rows in the active bag (personal cart or group order). */
export async function listPlainCartLines(): Promise<PlainCartLine[]> {
  const overlay = await getGroupCartOverlayLines();
  if (overlay) {
    return uniqueByProduct(
      overlay.items
        .filter((line) =>
          isQuickAddLine({
            modifiers: line.modifiers,
            variant: line.variant,
            attributeId: line.attributeId,
          }),
        )
        .map((line) => ({
          productId: line.product.id,
          itemId: line.id,
          quantity: line.quantity,
        })),
    );
  }

  const { items } = await getCartWithItems();
  return uniqueByProduct(
    items
      .filter((row) =>
        isQuickAddLine({
          modifiers: row.modifiers,
          variant: row.variant,
          attributeId: row.item.attributeId,
        }),
      )
      .map((row) => ({
        productId: row.product.id,
        itemId: row.item.id,
        quantity: row.item.quantity,
      })),
  );
}

async function findPlainLine(productId: string): Promise<PlainCartLine | null> {
  const lines = await listPlainCartLines();
  return lines.find((line) => line.productId === productId) ?? null;
}

async function setPersonalPlainLine(
  productId: string,
  quantity: number,
): Promise<PlainCartLineResult> {
  const existing = await findPlainLine(productId);
  if (quantity < 1) {
    if (existing) await removeItem(existing.itemId);
    return { ok: true, itemId: null, quantity: 0 };
  }

  if (existing) {
    await updateQuantity(existing.itemId, quantity);
  } else {
    await addToCart(productId, quantity);
  }

  const confirmed = await findPlainLine(productId);
  return {
    ok: true,
    itemId: confirmed?.itemId ?? null,
    quantity: confirmed?.quantity ?? 0,
  };
}

async function applyGroupQuantity(
  inviteToken: string,
  productId: string,
  quantity: number,
  existing: PlainCartLine | null,
): Promise<PlainCartLineResult | null> {
  if (quantity < 1) {
    if (!existing) return { ok: true, itemId: null, quantity: 0 };
    const removed = await removeGroupOrderItem({
      inviteToken,
      itemId: existing.itemId,
    });
    if (!removed.ok) {
      return { ok: false, error: await localizeGroupOrderMutationError(removed) };
    }
    return { ok: true, itemId: null, quantity: 0 };
  }

  if (existing) {
    const updated = await updateGroupOrderItemQuantity({
      inviteToken,
      itemId: existing.itemId,
      quantity,
    });
    if (!updated.ok) {
      return { ok: false, error: await localizeGroupOrderMutationError(updated) };
    }
    return null;
  }

  const added = await addGroupOrderItem({ inviteToken, productId, quantity });
  if (!added.ok) {
    return { ok: false, error: await localizeGroupOrderMutationError(added) };
  }
  return null;
}

async function setGroupPlainLine(
  inviteToken: string,
  canEdit: boolean,
  productId: string,
  quantity: number,
): Promise<PlainCartLineResult> {
  if (!canEdit) {
    return { ok: false, error: "Items can no longer be changed." };
  }

  const existing = await findPlainLine(productId);
  const applied = await applyGroupQuantity(
    inviteToken,
    productId,
    quantity,
    existing,
  );
  if (applied) {
    if (applied.ok) revalidateGroupBag(inviteToken);
    return applied;
  }

  revalidateGroupBag(inviteToken);
  const confirmed = await findPlainLine(productId);
  return {
    ok: true,
    itemId: confirmed?.itemId ?? null,
    quantity: confirmed?.quantity ?? 0,
  };
}

/**
 * Sets the absolute quantity of the plain (unconfigured) line for a product.
 * `0` removes that line. Does not touch rows that have modifiers or options.
 */
export async function setPlainCartLineQuantity(
  productId: string,
  quantity: number,
): Promise<PlainCartLineResult> {
  const invalid = invalidQuantity(quantity);
  if (invalid) return { ok: false, error: invalid };
  if (productId.trim().length === 0) {
    return { ok: false, error: "Invalid product." };
  }

  const overlay = await getGroupCartOverlayLines();
  try {
    if (!overlay) return await setPersonalPlainLine(productId, quantity);
    return await setGroupPlainLine(
      overlay.overlay.inviteToken,
      overlay.overlay.canEditItems,
      productId,
      quantity,
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "Unable to update cart.";
    return { ok: false, error: message };
  }
}
