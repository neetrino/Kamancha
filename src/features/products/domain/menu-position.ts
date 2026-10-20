/** Places `id` at a 1-based menu position. Ids already in the list are moved. */
export function insertIdAtPosition(
  orderedIds: readonly string[],
  id: string,
  position: number,
): string[] {
  const without = orderedIds.filter((item) => item !== id);
  const clamped = Math.min(
    Math.max(Math.trunc(position), 1),
    without.length + 1,
  );
  const next = [...without];
  next.splice(clamped - 1, 0, id);
  return next;
}

/** True when both lists have the same ids in the same order. */
export function sameIdOrder(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((id, index) => id === right[index])
  );
}
