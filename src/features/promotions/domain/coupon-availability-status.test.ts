import { describe, expect, it } from "vitest";

import { resolveCouponAvailabilityStatus } from "@/features/promotions/domain/coupon-availability-status";

const now = new Date("2026-06-15T12:00:00.000Z");

function coupon(
  overrides: Partial<Parameters<typeof resolveCouponAvailabilityStatus>[0]> = {},
) {
  return {
    isActive: true,
    startsAt: null,
    endsAt: null,
    totalUsageLimit: null,
    usedCount: 0,
    ...overrides,
  };
}

describe("resolveCouponAvailabilityStatus", () => {
  it("returns AVAILABLE when active and within limits", () => {
    expect(resolveCouponAvailabilityStatus(coupon(), now)).toBe("AVAILABLE");
  });

  it("returns INACTIVE when disabled", () => {
    expect(
      resolveCouponAvailabilityStatus(coupon({ isActive: false }), now),
    ).toBe("INACTIVE");
  });

  it("returns USED when usage limit is reached", () => {
    expect(
      resolveCouponAvailabilityStatus(
        coupon({ totalUsageLimit: 3, usedCount: 3 }),
        now,
      ),
    ).toBe("USED");
  });

  it("returns EXPIRED when endsAt is in the past", () => {
    expect(
      resolveCouponAvailabilityStatus(
        coupon({ endsAt: new Date("2026-06-01T00:00:00.000Z") }),
        now,
      ),
    ).toBe("EXPIRED");
  });

  it("returns SCHEDULED when startsAt is in the future", () => {
    expect(
      resolveCouponAvailabilityStatus(
        coupon({ startsAt: new Date("2026-07-01T00:00:00.000Z") }),
        now,
      ),
    ).toBe("SCHEDULED");
  });

  it("prefers USED over EXPIRED when both apply", () => {
    expect(
      resolveCouponAvailabilityStatus(
        coupon({
          totalUsageLimit: 1,
          usedCount: 1,
          endsAt: new Date("2026-06-01T00:00:00.000Z"),
        }),
        now,
      ),
    ).toBe("USED");
  });
});
