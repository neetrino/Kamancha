import { describe, expect, it } from "vitest";

import {
  adminNewOrderNotificationTag,
  formatAdminNewOrderNotification,
} from "@/features/admin-push/domain/new-order-notification";

describe("new-order notification", () => {
  it("uses a stable per-order tag shared by page and push notifications", () => {
    expect(adminNewOrderNotificationTag("p42")).toBe("admin-new-order-p42");
  });

  it("fills title and body placeholders", () => {
    const result = formatAdminNewOrderNotification(
      { pushTitle: "New order #{orderNumber}", pushBody: "{customer} · {total}" },
      {
        orderNumber: "p42",
        contactName: "Ani",
        totalAmount: 12500,
        baseCurrency: "AMD",
      },
    );
    expect(result.title).toBe("New order #p42");
    expect(result.body.startsWith("Ani · 12")).toBe(true);
    expect(result.body).toContain("500");
  });
});
