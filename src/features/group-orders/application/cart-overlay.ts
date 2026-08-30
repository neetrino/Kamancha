import { and, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  groupOrderItemModifiers,
  groupOrderItems,
  groupOrderParticipants,
  groupOrders,
  products,
} from "@/db/schema";
import {
  canEditGroupOrderItems,
  isGroupOrderBagActive,
  isGroupOrderStatus,
} from "@/features/group-orders/domain/status";
import { peekGroupOrderSession } from "@/features/group-orders/session";

export type GroupCartOverlay = {
  inviteToken: string;
  participantId: string;
  canEditItems: boolean;
};

export type GroupCartOverlayLine = {
  id: string;
  quantity: number;
  unitAmount: number;
  product: typeof products.$inferSelect;
  modifiers: OverlayModifierView[];
};

type OverlayModifierView = {
  id: string;
  kind: "ADDITION" | "EXCEPTION";
  name: string;
  priceAmount: number;
};

function asModifierKind(value: string): "ADDITION" | "EXCEPTION" | null {
  if (value === "ADDITION" || value === "EXCEPTION") return value;
  return null;
}

/** Active group session that owns the storefront bag (not personal checkout). */
export async function getGroupCartOverlay(): Promise<GroupCartOverlay | null> {
  const session = await peekGroupOrderSession();
  if (!session.inviteToken || !session.participantId) return null;

  const [row] = await getDb()
    .select({
      inviteToken: groupOrders.inviteToken,
      status: groupOrders.status,
      participantId: groupOrderParticipants.id,
      participantStatus: groupOrderParticipants.status,
    })
    .from(groupOrders)
    .innerJoin(
      groupOrderParticipants,
      eq(groupOrderParticipants.groupOrderId, groupOrders.id),
    )
    .where(
      and(
        eq(groupOrders.inviteToken, session.inviteToken),
        eq(groupOrderParticipants.id, session.participantId),
      ),
    )
    .limit(1);

  if (!row || row.participantStatus !== "ACTIVE") return null;
  if (!isGroupOrderStatus(row.status) || !isGroupOrderBagActive(row.status)) {
    return null;
  }

  return {
    inviteToken: row.inviteToken,
    participantId: row.participantId,
    canEditItems: canEditGroupOrderItems(row.status),
  };
}

/** Quantity in the group bag, or `null` when the personal cart applies. */
export async function getGroupCartOverlayItemCount(): Promise<number | null> {
  const overlay = await getGroupCartOverlay();
  if (!overlay) return null;

  const [row] = await getDb()
    .select({
      total: sql<number>`coalesce(sum(${groupOrderItems.quantity}), 0)::int`,
    })
    .from(groupOrderItems)
    .where(eq(groupOrderItems.participantId, overlay.participantId));

  return row?.total ?? 0;
}

export async function getGroupCartOverlayLines(): Promise<{
  overlay: GroupCartOverlay;
  items: GroupCartOverlayLine[];
} | null> {
  const overlay = await getGroupCartOverlay();
  if (!overlay) return null;

  const rows = await getDb()
    .select({ item: groupOrderItems, product: products })
    .from(groupOrderItems)
    .innerJoin(products, eq(groupOrderItems.productId, products.id))
    .where(eq(groupOrderItems.participantId, overlay.participantId));

  const modifiersByItem = await loadOverlayModifiers(
    rows.map((row) => row.item.id),
  );

  return {
    overlay,
    items: rows.map((row) => ({
      id: row.item.id,
      quantity: row.item.quantity,
      unitAmount: row.item.unitAmount,
      product: row.product,
      modifiers: modifiersByItem.get(row.item.id) ?? [],
    })),
  };
}

async function loadOverlayModifiers(
  itemIds: string[],
): Promise<Map<string, OverlayModifierView[]>> {
  const map = new Map<string, OverlayModifierView[]>();
  if (itemIds.length === 0) return map;

  const rows = await getDb()
    .select()
    .from(groupOrderItemModifiers)
    .where(inArray(groupOrderItemModifiers.groupOrderItemId, itemIds));

  for (const row of rows) {
    const kind = asModifierKind(row.kindSnapshot);
    if (!kind) continue;
    const entry = map.get(row.groupOrderItemId) ?? [];
    entry.push({
      id: row.modifierId,
      kind,
      name: row.nameSnapshot,
      priceAmount: row.priceAmountSnapshot,
    });
    map.set(row.groupOrderItemId, entry);
  }

  return map;
}
