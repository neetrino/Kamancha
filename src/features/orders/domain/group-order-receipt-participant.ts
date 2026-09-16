/**
 * Who appears on the group-order receipt (customer sheet and admin drawer).
 * Guests with an empty bag stay hidden; the organizer always stays visible.
 */
export function isListedOnGroupOrderReceipt(participant: {
  status: string;
  role: string;
  subtotalAmount: number;
}): boolean {
  if (participant.status !== "ACTIVE") return false;
  if (participant.role === "ORGANIZER") return true;
  return participant.subtotalAmount > 0;
}
