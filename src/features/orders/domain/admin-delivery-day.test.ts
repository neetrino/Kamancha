import { describe, expect, it } from "vitest";

import {
  addCalendarDaysYmd,
  classifyAdminDeliveryDay,
  formatYmdDisplay,
  groupOrdersByDeliveryDate,
} from "@/features/orders/domain/admin-delivery-day";

describe("admin-delivery-day", () => {
  it("formats and shifts YYYY-MM-DD calendar days", () => {
    expect(formatYmdDisplay("2026-10-02")).toBe("02.10.2026");
    expect(addCalendarDaysYmd("2026-10-02", 1)).toBe("2026-10-03");
    expect(addCalendarDaysYmd("2026-10-31", 1)).toBe("2026-11-01");
  });

  it("classifies today / tomorrow / other / none in Asia/Yerevan", () => {
    // 2026-10-02 12:00 UTC = 16:00 Yerevan
    const now = new Date("2026-10-02T12:00:00.000Z");
    expect(classifyAdminDeliveryDay("2026-10-02", now)).toBe("today");
    expect(classifyAdminDeliveryDay("2026-10-03", now)).toBe("tomorrow");
    expect(classifyAdminDeliveryDay("2026-10-05", now)).toBe("other");
    expect(classifyAdminDeliveryDay(null, now)).toBe("none");
  });

  it("groups by delivery date preserving first-seen order", () => {
    const groups = groupOrdersByDeliveryDate([
      {
        scheduledDeliveryDate: "2026-10-03",
        scheduledDeliveryStart: "12:00",
        scheduledDeliveryEnd: "13:00",
      },
      {
        scheduledDeliveryDate: "2026-10-02",
        scheduledDeliveryStart: "10:00",
        scheduledDeliveryEnd: "11:00",
      },
      {
        scheduledDeliveryDate: "2026-10-03",
        scheduledDeliveryStart: "14:00",
        scheduledDeliveryEnd: "15:00",
      },
      {
        scheduledDeliveryDate: null,
        scheduledDeliveryStart: null,
        scheduledDeliveryEnd: null,
      },
    ]);

    expect(groups.map((group) => group.date)).toEqual([
      "2026-10-03",
      "2026-10-02",
      null,
    ]);
    expect(groups[0]?.orders).toHaveLength(2);
  });
});
