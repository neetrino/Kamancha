import { isSuccessfulParticipantPayment } from "@/features/group-orders/domain/spend-limit";
import type { GroupOrderStatus } from "@/features/group-orders/domain/status";

export type SettlementParticipant = {
  status: string;
  finalAmount: number;
  paymentStatus: string;
};

/**
 * Participants who still owe money toward the group settlement.
 * NOT_REQUIRED (organizer-pays guests) and zero-amount rows are excluded.
 */
export function participantsNeedingPayment(
  participants: readonly SettlementParticipant[],
): SettlementParticipant[] {
  return participants.filter(
    (p) =>
      p.status === "ACTIVE" &&
      p.finalAmount > 0 &&
      p.paymentStatus !== "NOT_REQUIRED",
  );
}

/**
 * Post-checkout group status from participant payment rows.
 * Returns PAID only when every owing participant is settled.
 */
export function settlementStatusAfterCheckout(
  participants: readonly SettlementParticipant[],
): Extract<GroupOrderStatus, "PAID" | "PARTIALLY_PAID"> {
  const needing = participantsNeedingPayment(participants);
  if (needing.length === 0) {
    return "PAID";
  }
  const allPaid = needing.every((p) =>
    isSuccessfulParticipantPayment(p.paymentStatus),
  );
  return allPaid ? "PAID" : "PARTIALLY_PAID";
}

/** True when every owing participant has a successful payment. */
export function areAllOwingParticipantsPaid(
  participants: readonly SettlementParticipant[],
): boolean {
  return settlementStatusAfterCheckout(participants) === "PAID";
}
