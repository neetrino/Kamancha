import { describe, expect, it } from "vitest";

import {
  localizeOrderStatus,
  localizePaymentStatus,
} from "@/features/orders/ui/localize-order-status";

const hyLabels = {
  pending: "Սպասող",
  processing: "Ընթացքի մեջ",
  completed: "Ավարտված",
  cancelled: "Չեղարկված",
  paid: "Վճարված",
  failed: "Չհաջողված",
};

describe("localizeOrderStatus", () => {
  it("maps grouped order statuses to locale labels", () => {
    expect(localizeOrderStatus("PENDING", hyLabels)).toBe("Սպասող");
    expect(localizeOrderStatus("CONFIRMED", hyLabels)).toBe("Սպասող");
    expect(localizeOrderStatus("PROCESSING", hyLabels)).toBe("Ընթացքի մեջ");
    expect(localizeOrderStatus("SHIPPED", hyLabels)).toBe("Ընթացքի մեջ");
    expect(localizeOrderStatus("DELIVERED", hyLabels)).toBe("Ավարտված");
    expect(localizeOrderStatus("CANCELLED", hyLabels)).toBe("Չեղարկված");
    expect(localizeOrderStatus("REFUNDED", hyLabels)).toBe("Չեղարկված");
  });

  it("returns the raw token for unknown statuses", () => {
    expect(localizeOrderStatus("UNKNOWN", hyLabels)).toBe("UNKNOWN");
  });
});

describe("localizePaymentStatus", () => {
  it("maps grouped payment statuses to locale labels", () => {
    expect(localizePaymentStatus("CAPTURED", hyLabels)).toBe("Վճարված");
    expect(localizePaymentStatus("PENDING", hyLabels)).toBe("Սպասող");
    expect(localizePaymentStatus("FAILED", hyLabels)).toBe("Չհաջողված");
  });
});
