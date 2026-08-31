/**
 * Per-participant spend limit rules (merchandise subtotal only).
 */

/** Soft cap for organizer-entered limit (AMD). Above this → clear client/server error. */
export const GROUP_ORDER_SPEND_LIMIT_MAX = 1_000_000;

/** Stable mutation error code when the next subtotal would exceed the cap. */
export const SPEND_LIMIT_EXCEEDED_ERROR = "EXCEEDS_LIMIT";

export type SpendLimitCheck =
  | { ok: true }
  | {
      ok: false;
      reason: "EXCEEDS_LIMIT";
      limitAmount: number;
      subtotalAmount: number;
    };

export type ParseSpendLimitResult =
  | { ok: true; value: number | null }
  | { ok: false; reason: "invalid" | "too_large" };

/** Parses organizer spend-limit input; empty → unlimited (null). */
export function parseSpendLimitInput(raw: string): ParseSpendLimitResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, value: null };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, reason: "invalid" };
  }
  if (trimmed.length > String(GROUP_ORDER_SPEND_LIMIT_MAX).length) {
    return { ok: false, reason: "too_large" };
  }
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isSafeInteger(value) || value < 1) {
    return { ok: false, reason: "invalid" };
  }
  if (value > GROUP_ORDER_SPEND_LIMIT_MAX) {
    return { ok: false, reason: "too_large" };
  }
  return { ok: true, value };
}

/** Null/undefined limit means unlimited. */
export function checkSpendLimit(
  subtotalAmount: number,
  spendLimitAmount: number | null | undefined,
): SpendLimitCheck {
  if (spendLimitAmount == null) {
    return { ok: true };
  }
  if (subtotalAmount <= spendLimitAmount) {
    return { ok: true };
  }
  return {
    ok: false,
    reason: "EXCEEDS_LIMIT",
    limitAmount: spendLimitAmount,
    subtotalAmount,
  };
}

export function isSuccessfulParticipantPayment(status: string): boolean {
  return status === "PAID" || status === "MARKED_RECEIVED";
}
