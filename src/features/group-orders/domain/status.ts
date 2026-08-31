/** Canonical group-order lifecycle statuses. */
export const GROUP_ORDER_STATUSES = [
  "OPEN",
  "LOCKED",
  "AWAITING_PAYMENTS",
  "CHECKOUT",
  "PARTIALLY_PAID",
  "PAID",
  "PREPARING",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type GroupOrderStatus = (typeof GROUP_ORDER_STATUSES)[number];

export const GROUP_ORDER_PAYMENT_MODES = [
  "ORGANIZER_PAYS_ALL",
  "SPLIT_PER_PARTICIPANT",
] as const;

export type GroupOrderPaymentMode = (typeof GROUP_ORDER_PAYMENT_MODES)[number];

/**
 * Allowed transitions. Terminal: EXPIRED, CANCELLED, COMPLETED.
 * Organizer-pays flow may skip AWAITING_PAYMENTS (OPEN → LOCKED → CHECKOUT).
 * CHECKOUT → PARTIALLY_PAID when some (not all) owing participants are settled.
 */
const TRANSITIONS: Record<GroupOrderStatus, readonly GroupOrderStatus[]> = {
  OPEN: ["LOCKED", "EXPIRED", "CANCELLED"],
  LOCKED: ["AWAITING_PAYMENTS", "CHECKOUT", "OPEN", "CANCELLED", "EXPIRED"],
  AWAITING_PAYMENTS: ["CHECKOUT", "CANCELLED", "EXPIRED"],
  CHECKOUT: ["PARTIALLY_PAID", "PAID", "CANCELLED", "EXPIRED"],
  PARTIALLY_PAID: ["PAID", "PREPARING", "CANCELLED"],
  PAID: ["PREPARING", "CANCELLED"],
  PREPARING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  EXPIRED: [],
  CANCELLED: [],
};

const ITEM_EDITABLE: ReadonlySet<GroupOrderStatus> = new Set(["OPEN"]);

const JOINABLE: ReadonlySet<GroupOrderStatus> = new Set(["OPEN"]);

/** Bag UI + personal checkout are owned by the group until organizer checkout. */
const BAG_ACTIVE: ReadonlySet<GroupOrderStatus> = new Set([
  "OPEN",
  "LOCKED",
  "AWAITING_PAYMENTS",
]);

export function isGroupOrderStatus(value: string): value is GroupOrderStatus {
  return (GROUP_ORDER_STATUSES as readonly string[]).includes(value);
}

export function canTransitionGroupOrderStatus(
  from: GroupOrderStatus,
  to: GroupOrderStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function canEditGroupOrderItems(status: GroupOrderStatus): boolean {
  return ITEM_EDITABLE.has(status);
}

export function canJoinGroupOrder(status: GroupOrderStatus): boolean {
  return JOINABLE.has(status);
}

/**
 * While collecting/locking, the storefront bag shows group lines and
 * personal `/checkout` is blocked in favor of the group-order page.
 */
export function isGroupOrderBagActive(status: GroupOrderStatus): boolean {
  return BAG_ACTIVE.has(status);
}

/** Whether payment mode can still be changed (no successful payment yet). */
export function canChangePaymentMode(hasSuccessfulPayment: boolean): boolean {
  return !hasSuccessfulPayment;
}

/**
 * After locking: organizer-pays goes to CHECKOUT; split goes to AWAITING_PAYMENTS.
 */
export function nextStatusAfterLock(
  paymentMode: GroupOrderPaymentMode,
): GroupOrderStatus {
  return paymentMode === "ORGANIZER_PAYS_ALL"
    ? "CHECKOUT"
    : "AWAITING_PAYMENTS";
}

/**
 * Organizer leaving an organizer-pays session dissolves the group for everyone.
 * Split mode keeps the order (session cookie only is cleared).
 */
export function shouldDissolveGroupOrderOnOrganizerLeave(input: {
  paymentMode: GroupOrderPaymentMode;
  participantRole: string;
  status: GroupOrderStatus;
}): boolean {
  return (
    input.participantRole === "ORGANIZER" &&
    input.paymentMode === "ORGANIZER_PAYS_ALL" &&
    canTransitionGroupOrderStatus(input.status, "CANCELLED")
  );
}

/** Default TTL for a new group-order session (48 hours). */
export const GROUP_ORDER_DEFAULT_TTL_MS = 48 * 60 * 60 * 1000;
