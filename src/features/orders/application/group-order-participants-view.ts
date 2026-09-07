import "server-only";

import { and, desc, eq, gt, inArray } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  groupOrderEvents,
  groupOrderParticipants,
  groupOrders,
  payments,
} from "@/db/schema";
import { loadCustomerGroupOrderShareItems } from "@/features/orders/application/customer-group-order-share";
import { paymentMethodLabel } from "@/features/orders/domain/payment-method-label";
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
  /** Localized payment method label, or null when not applicable / unknown. */
  paymentMethod: string | null;
  items: GroupParticipantItemView[];
};

export type GroupOrderPaymentMode =
  | "ORGANIZER_PAYS_ALL"
  | "SPLIT_PER_PARTICIPANT";

export type AdminGroupOrderParticipantsBundle = {
  paymentMode: GroupOrderPaymentMode;
  participants: AdminGroupOrderParticipantView[];
};

function methodFromProviderOrCode(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  return paymentMethodLabel(value);
}

/** Active paid participants with their captured group-bag lines for admin view. */
export async function loadAdminGroupOrderParticipantsView(input: {
  groupOrderId: string;
  locale: Locale;
  currency: string;
}): Promise<AdminGroupOrderParticipantsBundle> {
  const db = getDb();

  const [groupOrder] = await db
    .select({
      id: groupOrders.id,
      orderId: groupOrders.orderId,
      paymentMode: groupOrders.paymentMode,
    })
    .from(groupOrders)
    .where(eq(groupOrders.id, input.groupOrderId))
    .limit(1);

  if (!groupOrder) {
    return { paymentMode: "ORGANIZER_PAYS_ALL", participants: [] };
  }

  const participants = await db
    .select({
      id: groupOrderParticipants.id,
      displayName: groupOrderParticipants.displayName,
      role: groupOrderParticipants.role,
      paymentStatus: groupOrderParticipants.paymentStatus,
      paymentId: groupOrderParticipants.paymentId,
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

  if (participants.length === 0) {
    return {
      paymentMode: groupOrder.paymentMode,
      participants: [],
    };
  }

  const paymentIds = participants
    .map((row) => row.paymentId)
    .filter((id): id is string => Boolean(id));
  const participantIds = participants.map((row) => row.id);

  const [paymentRows, participantPaymentRows, eventRows, orderPaymentRows] =
    await Promise.all([
    paymentIds.length === 0
      ? Promise.resolve(
          [] as Array<{ id: string; method: string; groupOrderParticipantId: string | null }>,
        )
      : db
          .select({
            id: payments.id,
            method: payments.method,
            groupOrderParticipantId: payments.groupOrderParticipantId,
          })
          .from(payments)
          .where(inArray(payments.id, paymentIds)),
    db
      .select({
        id: payments.id,
        method: payments.method,
        groupOrderParticipantId: payments.groupOrderParticipantId,
      })
      .from(payments)
      .where(inArray(payments.groupOrderParticipantId, participantIds)),
    db
      .select({
        actorParticipantId: groupOrderEvents.actorParticipantId,
        payload: groupOrderEvents.payload,
      })
      .from(groupOrderEvents)
      .where(
        and(
          eq(groupOrderEvents.groupOrderId, input.groupOrderId),
          eq(groupOrderEvents.eventType, "PAYMENT_STATUS"),
        ),
      )
      .orderBy(desc(groupOrderEvents.createdAt)),
    groupOrder?.orderId
      ? db
          .select({
            method: payments.method,
            groupOrderParticipantId: payments.groupOrderParticipantId,
          })
          .from(payments)
          .where(eq(payments.orderId, groupOrder.orderId))
          .orderBy(desc(payments.createdAt))
      : Promise.resolve(
          [] as Array<{ method: string; groupOrderParticipantId: string | null }>,
        ),
  ]);

  const methodByPaymentId = new Map(
    paymentRows.map((row) => [row.id, row.method] as const),
  );

  const methodByParticipantFromPayments = new Map<string, string>();
  for (const row of [...paymentRows, ...participantPaymentRows]) {
    if (row.groupOrderParticipantId) {
      methodByParticipantFromPayments.set(
        row.groupOrderParticipantId,
        row.method,
      );
    }
  }
  for (const row of orderPaymentRows) {
    if (row.groupOrderParticipantId) {
      methodByParticipantFromPayments.set(
        row.groupOrderParticipantId,
        row.method,
      );
    }
  }

  const providerByParticipant = new Map<string, string>();
  for (const row of eventRows) {
    if (!row.actorParticipantId || providerByParticipant.has(row.actorParticipantId)) {
      continue;
    }
    const payload = row.payload;
    const provider =
      payload && typeof payload.provider === "string" ? payload.provider : null;
    if (provider) {
      providerByParticipant.set(row.actorParticipantId, provider);
    }
  }

  const checkoutMethod =
    orderPaymentRows.find((row) => !row.groupOrderParticipantId)?.method ??
    orderPaymentRows[0]?.method ??
    null;

  return {
    paymentMode: groupOrder.paymentMode,
    participants: await Promise.all(
      participants.map(async (participant) => {
        const fromPaymentId = participant.paymentId
          ? methodByPaymentId.get(participant.paymentId)
          : undefined;
        const fromParticipantPayment = methodByParticipantFromPayments.get(
          participant.id,
        );
        const fromEvent = providerByParticipant.get(participant.id);

        let paymentMethod: string | null = null;
        if (fromPaymentId) {
          paymentMethod = methodFromProviderOrCode(fromPaymentId);
        } else if (fromParticipantPayment) {
          paymentMethod = methodFromProviderOrCode(fromParticipantPayment);
        } else if (fromEvent) {
          paymentMethod = methodFromProviderOrCode(fromEvent);
        } else if (
          participant.role === "ORGANIZER" &&
          (participant.paymentStatus === "PAID" ||
            participant.paymentStatus === "MARKED_RECEIVED") &&
          checkoutMethod
        ) {
          paymentMethod = methodFromProviderOrCode(checkoutMethod);
        } else if (participant.paymentStatus === "MARKED_RECEIVED") {
          paymentMethod = methodFromProviderOrCode("CASH");
        }

        return {
          id: participant.id,
          displayName: participant.displayName,
          subtotalAmount: participant.subtotalAmount,
          deliveryShareAmount: participant.deliveryShareAmount,
          finalAmount: participant.finalAmount,
          paymentMethod,
          items: await loadCustomerGroupOrderShareItems({
            participantId: participant.id,
            locale: input.locale,
            currency: input.currency,
          }),
        };
      }),
    ),
  };
}
