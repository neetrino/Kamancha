import { describe, expect, it } from "vitest";

import {
  bonusEligibleMerchandiseAmount,
  calculateBonusEarnAmount,
  calculateMaxRedeemAmount,
  clampBonusRedeemRequest,
  nextBonusBalance,
} from "@/features/bonuses/domain/bonus-rules";

describe("bonus rules", () => {
  it("computes eligible merchandise excluding delivery", () => {
    expect(bonusEligibleMerchandiseAmount(20_000, 0)).toBe(20_000);
    expect(bonusEligibleMerchandiseAmount(20_000, 2_000)).toBe(18_000);
    expect(bonusEligibleMerchandiseAmount(1_000, 2_000)).toBe(0);
  });

  it("earns floor percent of eligible amount", () => {
    expect(calculateBonusEarnAmount(20_000, 1)).toBe(200);
    expect(calculateBonusEarnAmount(15_050, 1)).toBe(150);
    expect(calculateBonusEarnAmount(100, 0)).toBe(0);
  });

  it("caps redeem by balance, percent, and merchandise", () => {
    expect(
      calculateMaxRedeemAmount({
        eligibleMerchandiseAmount: 15_000,
        availableBalance: 5_000,
        maxRedeemPercent: 20,
      }),
    ).toBe(3_000);

    expect(
      calculateMaxRedeemAmount({
        eligibleMerchandiseAmount: 15_000,
        availableBalance: 500,
        maxRedeemPercent: 20,
      }),
    ).toBe(500);
  });

  it("clamps redeem requests and balances", () => {
    expect(clampBonusRedeemRequest(1_500, 3_000)).toBe(1_500);
    expect(clampBonusRedeemRequest(5_000, 3_000)).toBe(3_000);
    expect(clampBonusRedeemRequest(-10, 3_000)).toBe(0);
    expect(nextBonusBalance(100, -150)).toBe(0);
    expect(nextBonusBalance(100, 50)).toBe(150);
  });
});
