import { describe, expect, it } from "vitest";

import {
  AUTO_REPLENISH_TARGET,
  AUTO_REPLENISH_THRESHOLD,
  applyAutoReplenish,
} from "@/features/products/domain/auto-replenish-stock";

describe("applyAutoReplenish", () => {
  it("refills when stock equals the threshold", () => {
    expect(applyAutoReplenish(AUTO_REPLENISH_THRESHOLD)).toBe(
      AUTO_REPLENISH_TARGET,
    );
  });

  it("refills when stock is below the threshold", () => {
    expect(applyAutoReplenish(AUTO_REPLENISH_THRESHOLD - 1)).toBe(
      AUTO_REPLENISH_TARGET,
    );
  });

  it("leaves stock unchanged above the threshold", () => {
    expect(applyAutoReplenish(AUTO_REPLENISH_THRESHOLD + 1)).toBe(
      AUTO_REPLENISH_THRESHOLD + 1,
    );
  });
});
