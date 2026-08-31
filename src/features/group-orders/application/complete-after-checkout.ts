import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants, groupOrders, orders } from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import { assertOrganizerAccess } from "@/features/group-orders/application/access";
import { appendGroupOrderEvent } from "@/features/group-orders/application/money";
import { settlementStatusAfterCheckout } from "@/features/group-orders/domain/settlement";
import { canTransitionGroupOrderStatus } from "@/features/group-orders/domain/status";
import { peekGroupOrderSession } from "@/features/group-orders/session";

type DbLike = ReturnType<typeof getDb> | DbTransaction;

/**
 * If the organizer is finishing a group order via standard checkout,
 * link the created order, mark the organizer share paid, and set the
 * group session to PAID or PARTIALLY_PAID from participant settlement.
 */
export async function completeGroupOrderAfterStandardCheckout(input: {
  orderId: string;
  orderNumber: string;
  tx?: DbLike;
}): Promise<{ completed: boolean }> {
  const session = await peekGroupOrderSession();
  if (!session.inviteToken) {
    return { completed: false };
  }

  const access = await assertOrganizerAccess(session.inviteToken);
  if (!access.ok) {
    return { completed: false };
  }
  if (access.groupOrder.status !== "CHECKOUT") {
    return { completed: false };
  }

  const db = input.tx ?? getDb();

  const active = await db
    .select({
      id: groupOrderParticipants.id,
      status: groupOrderParticipants.status,
      finalAmount: groupOrderParticipants.finalAmount,
      paymentStatus: groupOrderParticipants.paymentStatus,
    })
    .from(groupOrderParticipants)
    .where(eq(groupOrderParticipants.groupOrderId, access.groupOrder.id));

  const afterOrganizerPaid = active.map((row) =>
    row.id === access.participant.id
      ? { ...row, paymentStatus: "PAID" }
      : row,
  );
  const nextStatus = settlementStatusAfterCheckout(afterOrganizerPaid);
  if (!canTransitionGroupOrderStatus("CHECKOUT", nextStatus)) {
    return { completed: false };
  }

  await db
    .update(groupOrderParticipants)
    .set({
      paymentStatus: "PAID",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(groupOrderParticipants.id, access.participant.id),
        eq(groupOrderParticipants.groupOrderId, access.groupOrder.id),
      ),
    );

  await db
    .update(groupOrders)
    .set({
      status: nextStatus,
      orderId: input.orderId,
      updatedAt: new Date(),
    })
    .where(eq(groupOrders.id, access.groupOrder.id));

  await db
    .update(orders)
    .set({ groupOrderId: access.groupOrder.id })
    .where(eq(orders.id, input.orderId));

  await appendGroupOrderEvent(db, {
    groupOrderId: access.groupOrder.id,
    eventType: "STATUS_CHANGE",
    fromState: "CHECKOUT",
    toState: nextStatus,
    actorParticipantId: access.participant.id,
    payload: {
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      source: "standard_checkout",
    },
  });

  return { completed: true };
}
