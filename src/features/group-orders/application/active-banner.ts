import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants, groupOrders } from "@/db/schema";
import { peekGroupOrderSession } from "@/features/group-orders/session";

export type ActiveGroupOrderBannerData = {
  inviteToken: string;
  organizerDisplayName: string;
  isOrganizer: boolean;
};

/** Lightweight read for the storefront active-session banner. */
export async function getActiveGroupOrderBanner(): Promise<ActiveGroupOrderBannerData | null> {
  const session = await peekGroupOrderSession();
  if (!session.inviteToken || !session.participantId) return null;

  const [row] = await getDb()
    .select({
      inviteToken: groupOrders.inviteToken,
      organizerDisplayName: groupOrders.organizerDisplayName,
      status: groupOrders.status,
      participantRole: groupOrderParticipants.role,
      participantStatus: groupOrderParticipants.status,
    })
    .from(groupOrders)
    .innerJoin(
      groupOrderParticipants,
      and(
        eq(groupOrderParticipants.groupOrderId, groupOrders.id),
        eq(groupOrderParticipants.id, session.participantId),
      ),
    )
    .where(eq(groupOrders.inviteToken, session.inviteToken))
    .limit(1);

  if (!row) return null;
  if (row.participantStatus !== "ACTIVE") return null;
  if (
    row.status === "CANCELLED" ||
    row.status === "EXPIRED" ||
    row.status === "COMPLETED"
  ) {
    return null;
  }

  return {
    inviteToken: row.inviteToken,
    organizerDisplayName: row.organizerDisplayName,
    isOrganizer: row.participantRole === "ORGANIZER",
  };
}

/** Minimal lifecycle status for remote cancel / dissolve detection. */
export async function getGroupOrderStatusByInvite(
  inviteToken: string,
): Promise<{ status: string } | null> {
  const [row] = await getDb()
    .select({ status: groupOrders.status })
    .from(groupOrders)
    .where(eq(groupOrders.inviteToken, inviteToken))
    .limit(1);
  return row ?? null;
}
