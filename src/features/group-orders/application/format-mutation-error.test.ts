import { describe, expect, it } from "vitest";

import { formatGroupOrderMutationError } from "@/features/group-orders/application/format-mutation-error";
import { SPEND_LIMIT_EXCEEDED_ERROR } from "@/features/group-orders/domain/spend-limit";

describe("formatGroupOrderMutationError", () => {
  it("explains a spend-limit rejection with formatted amounts", () => {
    const message = formatGroupOrderMutationError(
      {
        error: SPEND_LIMIT_EXCEEDED_ERROR,
        limitAmount: 3000,
        subtotalAmount: 4200,
      },
      "hy",
    );

    expect(message).toContain("3.000 ֏");
    expect(message).toContain("4.200 ֏");
    expect(message).not.toBe(SPEND_LIMIT_EXCEEDED_ERROR);
  });

  it("passes unknown error strings through", () => {
    expect(
      formatGroupOrderMutationError({ error: "Item not found." }, "en"),
    ).toBe("Item not found.");
  });
});
