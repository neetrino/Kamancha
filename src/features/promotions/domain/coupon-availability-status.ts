export type CouponAvailabilityStatus =
  | "AVAILABLE"
  | "USED"
  | "EXPIRED"
  | "INACTIVE"
  | "SCHEDULED";

export type CouponAvailabilityInput = {
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  totalUsageLimit: number | null;
  usedCount: number;
};

/**
 * Admin-list status for a coupon: usable vs used-up / expired / inactive.
 * Priority matches checkout rejection reasons for display purposes.
 */
export function resolveCouponAvailabilityStatus(
  coupon: CouponAvailabilityInput,
  now: Date = new Date(),
): CouponAvailabilityStatus {
  if (!coupon.isActive) {
    return "INACTIVE";
  }

  if (
    coupon.totalUsageLimit !== null &&
    coupon.usedCount >= coupon.totalUsageLimit
  ) {
    return "USED";
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    return "EXPIRED";
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return "SCHEDULED";
  }

  return "AVAILABLE";
}
