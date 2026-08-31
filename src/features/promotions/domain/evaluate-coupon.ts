import {
  computeDiscountAmount,
  type DiscountType,
} from "@/features/promotions/domain/promotion-rules";

export type CouponDiscountInput = {
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  minimumOrderAmount: number | null;
  totalUsageLimit: number | null;
  usedCount: number;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  /** Empty or omitted means the coupon is not user-restricted. */
  restrictedUserIds?: readonly string[];
};

export type CouponDiscountError =
  | "INVALID_OR_INACTIVE"
  | "NOT_YET_ACTIVE"
  | "EXPIRED"
  | "NOT_ELIGIBLE"
  | "MINIMUM_NOT_MET"
  | "USAGE_LIMIT";

/**
 * Empty allowlist = any customer or guest. Non-empty = only those user ids.
 */
export function isCouponAllowedForUser(
  restrictedUserIds: readonly string[] | undefined,
  userId: string | null | undefined,
): boolean {
  if (!restrictedUserIds || restrictedUserIds.length === 0) {
    return true;
  }
  if (!userId) {
    return false;
  }
  return restrictedUserIds.includes(userId);
}

/**
 * Validates an active coupon row against the order subtotal and returns the discount.
 * Does not perform DB lookups or usage increments.
 */
export function evaluateCouponDiscount(
  coupon: CouponDiscountInput | null | undefined,
  subtotal: number,
  now: Date = new Date(),
  userId: string | null = null,
):
  | { ok: true; discountAmount: number }
  | { ok: false; error: CouponDiscountError } {
  if (!coupon || !coupon.isActive) {
    return { ok: false, error: "INVALID_OR_INACTIVE" };
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, error: "NOT_YET_ACTIVE" };
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    return { ok: false, error: "EXPIRED" };
  }

  if (!isCouponAllowedForUser(coupon.restrictedUserIds, userId)) {
    return { ok: false, error: "NOT_ELIGIBLE" };
  }

  if (
    coupon.minimumOrderAmount !== null &&
    subtotal < coupon.minimumOrderAmount
  ) {
    return { ok: false, error: "MINIMUM_NOT_MET" };
  }

  if (
    coupon.totalUsageLimit !== null &&
    coupon.usedCount >= coupon.totalUsageLimit
  ) {
    return { ok: false, error: "USAGE_LIMIT" };
  }

  return {
    ok: true,
    discountAmount: computeDiscountAmount(
      subtotal,
      coupon.discountType,
      coupon.discountValue,
      coupon.maxDiscountAmount,
    ),
  };
}

export function couponDiscountErrorMessage(error: CouponDiscountError): string {
  switch (error) {
    case "INVALID_OR_INACTIVE":
      return "Invalid or inactive coupon.";
    case "NOT_YET_ACTIVE":
      return "Coupon is not active yet.";
    case "EXPIRED":
      return "Coupon has expired.";
    case "NOT_ELIGIBLE":
      return "This coupon is not available for your account.";
    case "MINIMUM_NOT_MET":
      return "Order does not meet coupon minimum.";
    case "USAGE_LIMIT":
      return "Coupon usage limit reached.";
  }
}
