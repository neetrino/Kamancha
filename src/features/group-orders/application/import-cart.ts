import { getCartWithItems } from "@/features/cart/cart";
import { addGroupOrderItem } from "@/features/group-orders/application/items";

/**
 * Copies the caller's personal cart into the active group-order session
 * so the bag and the group page show the same lines.
 */
export async function importPersonalCartIntoGroupOrder(
  inviteToken: string,
): Promise<void> {
  const { items } = await getCartWithItems();
  for (const line of items) {
    await addGroupOrderItem({
      inviteToken,
      productId: line.product.id,
      quantity: line.item.quantity,
      modifierIds: line.modifiers.map((modifier) => modifier.id),
    });
  }
}
