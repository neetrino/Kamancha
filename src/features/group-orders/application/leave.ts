import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants, groupOrders } from "@/db/schema";
import { appendGroupOrderEvent } from "@/features/group-orders/application/money";
import {
  shouldDissolveGroupOrderOnOrganizerLeave,
  type GroupOrderPaymentMode,
  type GroupOrderStatus,
} from "@/features/group-orders/domain/status";
import { peekGroupOrderSession } from "@/features/group-orders/session";

/**
 * When the organizer leaves an ORGANIZER_PAYS_ALL session, cancel the order
 * and mark every active participant as LEFT so the group is dissolved.
 * Returns the invite token when a dissolve happened (for cache revalidation).
 */
export async function dissolveOrganizerPaysAllOnLeave(): Promise<{
  dissolvedInviteToken: string | null;
}> {
  const session = await peekGroupOrderSession();
  if (!session.inviteToken || !session.participantId) {
    return { dissolvedInviteToken: null };
  }

  const db = getDb();
  const [groupOrder] = await db
    .select()
    .from(groupOrders)
    .where(eq(groupOrders.inviteToken, session.inviteToken))
    .limit(1);
  if (!groupOrder) return { dissolvedInviteToken: null };

  const [participant] = await db
    .select()
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.id, session.participantId),
        eq(groupOrderParticipants.groupOrderId, groupOrder.id),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    )
    .limit(1);
  if (!participant) return { dissolvedInviteToken: null };

  const status = groupOrder.status as GroupOrderStatus;
  if (
    !shouldDissolveGroupOrderOnOrganizerLeave({
      paymentMode: groupOrder.paymentMode as GroupOrderPaymentMode,
      participantRole: participant.role,
      status,
    })
  ) {
    return { dissolvedInviteToken: null };
  }

  const activeParticipants = await db
    .select({ id: groupOrderParticipants.id })
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, groupOrder.id),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    );

  await db
    .update(groupOrders)
    .set({ status: "CANCELLED", updatedAt: new Date() })
    .where(eq(groupOrders.id, groupOrder.id));

  await db
    .update(groupOrderParticipants)
    .set({ status: "LEFT", updatedAt: new Date() })
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, groupOrder.id),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    );

  await appendGroupOrderEvent(db, {
    groupOrderId: groupOrder.id,
    eventType: "STATUS_CHANGE",
    fromState: status,
    toState: "CANCELLED",
    actorParticipantId: participant.id,
    payload: { reason: "organizer_left" },
  });

  await appendGroupOrderEvent(db, {
    groupOrderId: groupOrder.id,
    eventType: "PARTICIPANT_LEFT",
    actorParticipantId: participant.id,
    payload: {
      reason: "organizer_left",
      participantIds: activeParticipants.map((row) => row.id),
    },
  });

  return { dissolvedInviteToken: groupOrder.inviteToken };
}
