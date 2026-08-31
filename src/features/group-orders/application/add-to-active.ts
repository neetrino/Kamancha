"use server";

import { revalidatePath } from "next/cache";

import { addToCart, revalidateCartPaths } from "@/features/cart/cart";
import { getGroupCartOverlay } from "@/features/group-orders/application/cart-overlay";
import { localizeGroupOrderMutationError } from "@/features/group-orders/application/format-mutation-error";
import { addGroupOrderItem } from "@/features/group-orders/application/items";

/**
 * Adds to the active group bag while collecting; otherwise the personal cart.
 */
export async function addProductToActiveCart(
  productId: string,
  quantity: number,
  options?: { modifierIds?: string[] },
): Promise<{ ok: true; target: "group" | "cart" } | { ok: false; error: string }> {
  const overlay = await getGroupCartOverlay();
  if (overlay) {
    const result = await addGroupOrderItem({
      inviteToken: overlay.inviteToken,
      productId,
      quantity,
      modifierIds: options?.modifierIds,
    });
    if (!result.ok) {
      return {
        ok: false,
        error: await localizeGroupOrderMutationError(result),
      };
    }
    await revalidateCartPaths();
    revalidatePath("/", "layout");
    revalidatePath(`/[locale]/group-orders/${overlay.inviteToken}`, "page");
    return { ok: true, target: "group" };
  }

  try {
    await addToCart(productId, quantity, options);
    return { ok: true, target: "cart" };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to add to cart.",
    };
  }
}
