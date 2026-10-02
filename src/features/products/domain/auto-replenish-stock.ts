/** When on-hand stock reaches this level, refill to the target. */
export const AUTO_REPLENISH_THRESHOLD = 10_000;

/** Target quantity after auto-replenish. */
export const AUTO_REPLENISH_TARGET = 100_000;

/**
 * Returns the target stock when the balance has dropped to (or below) the
 * replenish threshold; otherwise returns the given balance unchanged.
 */
export function applyAutoReplenish(stockOnHand: number): number {
  return stockOnHand <= AUTO_REPLENISH_THRESHOLD
    ? AUTO_REPLENISH_TARGET
    : stockOnHand;
}
