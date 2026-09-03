import "server-only";

import { and, eq, gt } from "drizzle-orm";

import { getDb } from "@/db/client";
import { groupOrderParticipants } from "@/db/schema";
import { loadCustomerGroupOrderShareItems } from "@/features/orders/application/customer-group-order-share";
import type { Locale } from "@/lib/i18n/config";

type GroupParticipantItemView = Awaited<
  ReturnType<typeof loadCustomerGroupOrderShareItems>
>[number];

export type AdminGroupOrderParticipantView = {
  id: string;
  displayName: string;
  subtotalAmount: number;
  deliveryShareAmount: number;
  finalAmount: number;
  items: GroupParticipantItemView[];
};

/** Active paid participants with their captured group-bag lines for admin view. */
export async function loadAdminGroupOrderParticipantsView(input: {
  groupOrderId: string;
  locale: Locale;
  currency: string;
}): Promise<AdminGroupOrderParticipantView[]> {
  const participants = await getDb()
    .select({
      id: groupOrderParticipants.id,
      displayName: groupOrderParticipants.displayName,
      subtotalAmount: groupOrderParticipants.subtotalAmount,
      deliveryShareAmount: groupOrderParticipants.deliveryShareAmount,
      finalAmount: groupOrderParticipants.finalAmount,
    })
    .from(groupOrderParticipants)
    .where(
      and(
        eq(groupOrderParticipants.groupOrderId, input.groupOrderId),
        eq(groupOrderParticipants.status, "ACTIVE"),
        gt(groupOrderParticipants.subtotalAmount, 0),
      ),
    )
    .orderBy(groupOrderParticipants.createdAt);

  return Promise.all(
    participants.map(async (participant) => ({
      ...participant,
      items: await loadCustomerGroupOrderShareItems({
        participantId: participant.id,
        locale: input.locale,
        currency: input.currency,
      }),
    })),
  );
}
