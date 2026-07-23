export type StoreDeliverySettings = {
  originAddress: string;
  originLat: number | null;
  originLng: number | null;
  /** Whole AMD charged per kilometer (fractional km kept in fee math). */
  pricePerKmAmount: number;
  isActive: boolean;
};

export const DEFAULT_DELIVERY_SETTINGS: StoreDeliverySettings = {
  originAddress: "",
  originLat: null,
  originLng: null,
  pricePerKmAmount: 0,
  isActive: false,
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Parses `store.delivery` JSON into a safe settings object. */
export function parseDeliverySettings(value: unknown): StoreDeliverySettings {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_DELIVERY_SETTINGS };
  }

  const record = value as Record<string, unknown>;
  const originAddress =
    typeof record.originAddress === "string"
      ? record.originAddress.trim().slice(0, 300)
      : "";
  const priceRaw = record.pricePerKmAmount;
  const pricePerKmAmount =
    typeof priceRaw === "number"
      ? priceRaw
      : typeof priceRaw === "string"
        ? Number(priceRaw)
        : 0;
  const originLat = isFiniteNumber(record.originLat) ? record.originLat : null;
  const originLng = isFiniteNumber(record.originLng) ? record.originLng : null;

  return {
    originAddress,
    originLat,
    originLng,
    pricePerKmAmount:
      Number.isInteger(pricePerKmAmount) && pricePerKmAmount >= 0
        ? pricePerKmAmount
        : 0,
    isActive: record.isActive === true,
  };
}

/** True when checkout can offer distance-based delivery. */
export function isDistanceDeliveryReady(
  settings: StoreDeliverySettings,
): boolean {
  return (
    settings.isActive &&
    settings.originAddress.trim().length > 0 &&
    settings.originLat != null &&
    settings.originLng != null &&
    settings.pricePerKmAmount >= 0
  );
}
