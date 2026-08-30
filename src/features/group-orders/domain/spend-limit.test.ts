import { describe, expect, it } from "vitest";

import { checkSpendLimit } from "@/features/group-orders/domain/spend-limit";

describe("checkSpendLimit", () => {
  it("allows any subtotal when the cap is unset", () => {
    expect(checkSpendLimit(10_000, null)).toEqual({ ok: true });
  });

  it("allows a subtotal equal to the cap", () => {
    expect(checkSpendLimit(3000, 3000)).toEqual({ ok: true });
  });

  it("rejects a subtotal above the cap", () => {
    expect(checkSpendLimit(3001, 3000)).toEqual({
      ok: false,
      reason: "EXCEEDS_LIMIT",
      limitAmount: 3000,
      subtotalAmount: 3001,
    });
  });
});
