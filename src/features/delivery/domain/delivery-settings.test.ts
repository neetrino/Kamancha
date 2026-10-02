import { describe, expect, it } from "vitest";

import {
  DEFAULT_DELIVERY_SETTINGS,
  isDeliveryOfferingEnabled,
  parseDeliverySettings,
} from "@/features/delivery/domain/delivery-settings";

describe("parseDeliverySettings", () => {
  it("returns defaults for empty input", () => {
    expect(parseDeliverySettings(null)).toEqual(DEFAULT_DELIVERY_SETTINGS);
  });

  it("parses active flag, schedule, and legacy map center", () => {
    expect(
      parseDeliverySettings({
        originAddress: "Tumanyan 40, Yerevan",
        originLat: 40.18,
        originLng: 44.51,
        pricePerKmAmount: 1000,
        isActive: true,
      }),
    ).toEqual({
      isActive: true,
      schedule: DEFAULT_DELIVERY_SETTINGS.schedule,
      cashChangeDenominations: DEFAULT_DELIVERY_SETTINGS.cashChangeDenominations,
      mapCenterLat: 40.18,
      mapCenterLng: 44.51,
    });
  });
});

describe("isDeliveryOfferingEnabled", () => {
  it("requires isActive", () => {
    expect(
      isDeliveryOfferingEnabled({
        ...DEFAULT_DELIVERY_SETTINGS,
        isActive: false,
      }),
    ).toBe(false);

    expect(
      isDeliveryOfferingEnabled({
        ...DEFAULT_DELIVERY_SETTINGS,
        isActive: true,
      }),
    ).toBe(true);
  });
});
