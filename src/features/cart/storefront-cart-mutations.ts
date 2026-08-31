"use server";

import { revalidatePath } from "next/cache";

import { removeItem, updateQuantity } from "@/features/cart/cart";
import { getGroupCartOverlay } from "@/features/group-orders/application/cart-overlay";
import { localizeGroupOrderMutationError } from "@/features/group-orders/application/format-mutation-error";
import {
  removeGroupOrderItem,
  updateGroupOrderItemQuantity,
} from "@/features/group-orders/application/items";

function revalidateStorefrontBag(inviteToken: string): void {
  revalidatePath(`/[locale]/group-orders/${inviteToken}`, "page");
  revalidatePath("/[locale]/cart", "page");
  revalidatePath("/", "layout");
}

/** Qty change for the storefront bag (personal cart or active group order). */
export async function updateStorefrontCartItem(
  itemId: string,
  quantity: number,
): Promise<void> {
  const overlay = await getGroupCartOverlay();
  if (!overlay) {
    await updateQuantity(itemId, quantity);
    return;
  }

  const result = await updateGroupOrderItemQuantity({
    inviteToken: overlay.inviteToken,
    itemId,
    quantity,
  });
  if (!result.ok) {
    throw new Error(await localizeGroupOrderMutationError(result));
  }
  revalidateStorefrontBag(overlay.inviteToken);
}

/** Remove a line from the storefront bag (personal cart or active group order). */
export async function removeStorefrontCartItem(itemId: string): Promise<void> {
  const overlay = await getGroupCartOverlay();
  if (!overlay) {
    await removeItem(itemId);
    return;
  }

  const result = await removeGroupOrderItem({
    inviteToken: overlay.inviteToken,
    itemId,
  });
  if (!result.ok) {
    throw new Error(result.error);
  }
  revalidateStorefrontBag(overlay.inviteToken);
}
