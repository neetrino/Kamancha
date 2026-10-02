import {
  createDefaultCashChangeDenominations,
  parseCashChangeDenominations,
  type CashChangeDenomination,
} from "@/features/delivery/domain/cash-change";
import {
  DEFAULT_DELIVERY_SCHEDULE,
  parseDeliverySchedule,
  type DeliveryScheduleSettings,
} from "@/features/delivery/domain/delivery-schedule";

export type StoreDeliverySettings = {
  isActive: boolean;
  schedule: DeliveryScheduleSettings;
  /** COD banknote options customers can select for change. */
  cashChangeDenominations: CashChangeDenomination[];
  /**
   * Optional map center from legacy origin settings (not edited in admin).
   * Used only as a fallback for the address map picker.
   */
  mapCenterLat: number | null;
  mapCenterLng: number | null;
};

export const DEFAULT_DELIVERY_SETTINGS: StoreDeliverySettings = {
  isActive: false,
  schedule: structuredClone(DEFAULT_DELIVERY_SCHEDULE),
  cashChangeDenominations: createDefaultCashChangeDenominations(),
  mapCenterLat: null,
  mapCenterLng: null,
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Parses `store.delivery` JSON into a safe settings object. */
export function parseDeliverySettings(value: unknown): StoreDeliverySettings {
  if (!value || typeof value !== "object") {
    return structuredClone(DEFAULT_DELIVERY_SETTINGS);
  }

  const record = value as Record<string, unknown>;
  const originLat = isFiniteNumber(record.originLat) ? record.originLat : null;
  const originLng = isFiniteNumber(record.originLng) ? record.originLng : null;

  return {
    isActive: record.isActive === true,
    schedule: parseDeliverySchedule(record.schedule),
    cashChangeDenominations: parseCashChangeDenominations(
      record.cashChangeDenominations,
    ),
    mapCenterLat: originLat,
    mapCenterLng: originLng,
  };
}

/** True when the storefront may offer delivery (zones configured separately). */
export function isDeliveryOfferingEnabled(
  settings: StoreDeliverySettings,
): boolean {
  return settings.isActive;
}
