import { describe, expect, it } from "vitest";

import {
  canEditGroupOrderItems,
  canJoinGroupOrder,
  canTransitionGroupOrderStatus,
  isGroupOrderBagActive,
  nextStatusAfterLock,
} from "@/features/group-orders/domain/status";

describe("group order status", () => {
  it("allows OPEN → LOCKED", () => {
    expect(canTransitionGroupOrderStatus("OPEN", "LOCKED")).toBe(true);
  });

  it("blocks edits after lock", () => {
    expect(canEditGroupOrderItems("OPEN")).toBe(true);
    expect(canEditGroupOrderItems("LOCKED")).toBe(false);
  });

  it("blocks joins after lock", () => {
    expect(canJoinGroupOrder("OPEN")).toBe(true);
    expect(canJoinGroupOrder("LOCKED")).toBe(false);
  });

  it("routes after lock by payment mode", () => {
    expect(nextStatusAfterLock("ORGANIZER_PAYS_ALL")).toBe("CHECKOUT");
    expect(nextStatusAfterLock("SPLIT_PER_PARTICIPANT")).toBe(
      "AWAITING_PAYMENTS",
    );
  });

  it("keeps the storefront bag on the group order until organizer checkout", () => {
    expect(isGroupOrderBagActive("OPEN")).toBe(true);
    expect(isGroupOrderBagActive("LOCKED")).toBe(true);
    expect(isGroupOrderBagActive("AWAITING_PAYMENTS")).toBe(true);
    expect(isGroupOrderBagActive("CHECKOUT")).toBe(false);
    expect(isGroupOrderBagActive("PAID")).toBe(false);
  });
});
