import "server-only";

import { and, eq, isNotNull, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants } from "@/db/schema";
import {
  hashGuestToken,
  peekGuestCartToken,
} from "@/features/cart/guest-token";

/**
 * Links ACTIVE guest group-order participant rows for the current browser
 * guest token to the signed-in user so those orders appear in profile history.
 *
 * Skips a group when the user already has an ACTIVE participant there.
 */
export async function claimGuestGroupOrderParticipantsForUser(
  userId: string,
): Promise<{ claimed: number }> {
  const guestToken = await peekGuestCartToken();
  if (!guestToken) {
    return { claimed: 0 };
  }

  const guestHash = hashGuestToken(guestToken);
  const db = getDb();

  const guestRows = await db
    .select({
      id: groupOrderParticipants.id,
      groupOrderId: groupOrderParticipants.groupOrderId,
    })
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.guestTokenHash, guestHash),
        eq(groupOrderParticipants.status, "ACTIVE"),
        isNull(groupOrderParticipants.userId),
        isNotNull(groupOrderParticipants.guestTokenHash),
      ),
    );

  let claimed = 0;
  for (const row of guestRows) {
    const [existing] = await db
      .select({ id: groupOrderParticipants.id })
      .from(groupOrderParticipants)
      .where(
        and(
          eq(groupOrderParticipants.groupOrderId, row.groupOrderId),
          eq(groupOrderParticipants.userId, userId),
          eq(groupOrderParticipants.status, "ACTIVE"),
        ),
      )
      .limit(1);

    if (existing) {
      continue;
    }

    await db
      .update(groupOrderParticipants)
      .set({
        userId,
        guestTokenHash: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(groupOrderParticipants.id, row.id),
          isNull(groupOrderParticipants.userId),
          eq(groupOrderParticipants.status, "ACTIVE"),
        ),
      );
    claimed += 1;
  }

  return { claimed };
}

/**
 * If a signed-in user is acting through a guest participant cookie, attach
 * that row to their account (or return their existing participant on the group).
 */
export async function claimOrResolveParticipantForUser(input: {
  userId: string;
  participant: typeof groupOrderParticipants.$inferSelect;
}): Promise<typeof groupOrderParticipants.$inferSelect> {
  const { userId, participant } = input;
  if (participant.userId === userId) {
    return participant;
  }

  const db = getDb();

  const [existing] = await db
    .select()
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, participant.groupOrderId),
        eq(groupOrderParticipants.userId, userId),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  if (participant.userId != null) {
    return participant;
  }

  await db
    .update(groupOrderParticipants)
    .set({
      userId,
      guestTokenHash: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(groupOrderParticipants.id, participant.id),
        isNull(groupOrderParticipants.userId),
        eq(groupOrderParticipants.status, "ACTIVE"),
      ),
    );

  const [claimed] = await db
    .select()
    .from(groupOrderParticipants)
    .where(eq(groupOrderParticipants.id, participant.id))
    .limit(1);

  return claimed ?? participant;
}
