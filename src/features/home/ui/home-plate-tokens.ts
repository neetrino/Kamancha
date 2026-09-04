export type WheelDirection = 1 | -1;

export type PlateSlot =
  | "nextFar"
  | "next"
  | "current"
  | "prev"
  | "prevFar";

export type PlateToken = {
  instanceId: string;
  categoryIndex: number;
  slot: PlateSlot;
};

/** Forward: travel right — enter left, exit right. */
const FORWARD_SHIFT: Partial<Record<PlateSlot, PlateSlot>> = {
  nextFar: "next",
  next: "current",
  current: "prev",
  prev: "prevFar",
};

/** Backward: travel left — enter right, exit left. */
const BACKWARD_SHIFT: Partial<Record<PlateSlot, PlateSlot>> = {
  prevFar: "prev",
  prev: "current",
  current: "next",
  next: "nextFar",
};

const PHONE_FORWARD_SHIFT: Partial<Record<PlateSlot, PlateSlot>> = {
  next: "current",
  current: "prev",
};

const PHONE_BACKWARD_SHIFT: Partial<Record<PlateSlot, PlateSlot>> = {
  prev: "current",
  current: "next",
};

let plateInstanceSeq = 0;

function nextInstanceId(): string {
  plateInstanceSeq += 1;
  return `plate-${plateInstanceSeq}`;
}

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function token(categoryIndex: number, slot: PlateSlot): PlateToken {
  return {
    instanceId: nextInstanceId(),
    categoryIndex,
    slot,
  };
}

/**
 * Seed tokens for the current index.
 * Instance ids stay unique even when the same category fills two slots.
 */
export function buildPlateTokens(
  index: number,
  count: number,
  tablet: boolean,
): PlateToken[] {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [token(0, "current")];
  }

  if (!tablet) {
    return [
      token(wrapIndex(index + 1, count), "next"),
      token(index, "current"),
      token(wrapIndex(index - 1, count), "prev"),
    ];
  }

  return [
    token(wrapIndex(index + 2, count), "nextFar"),
    token(wrapIndex(index + 1, count), "next"),
    token(index, "current"),
    token(wrapIndex(index - 1, count), "prev"),
    token(wrapIndex(index - 2, count), "prevFar"),
  ];
}

/**
 * Advance tokens one step. Surviving plates keep instanceId so Motion
 * tweens slot→slot; the new plate mounts on the enter side
 * (left on forward, right on backward).
 */
export function stepPlateTokens(
  previous: readonly PlateToken[],
  direction: WheelDirection,
  nextIndex: number,
  count: number,
  tablet: boolean,
): PlateToken[] {
  if (count <= 1) {
    return buildPlateTokens(nextIndex, count, tablet);
  }

  const shift = tablet
    ? direction === 1
      ? FORWARD_SHIFT
      : BACKWARD_SHIFT
    : direction === 1
      ? PHONE_FORWARD_SHIFT
      : PHONE_BACKWARD_SHIFT;

  const moved: PlateToken[] = [];
  for (const plate of previous) {
    const nextSlot = shift[plate.slot];
    if (nextSlot) {
      moved.push({ ...plate, slot: nextSlot });
    }
  }

  if (tablet) {
    if (direction === 1) {
      moved.push(token(wrapIndex(nextIndex + 2, count), "nextFar"));
    } else {
      moved.push(token(wrapIndex(nextIndex - 2, count), "prevFar"));
    }
    return moved;
  }

  if (direction === 1) {
    moved.push(token(wrapIndex(nextIndex + 1, count), "next"));
  } else {
    moved.push(token(wrapIndex(nextIndex - 1, count), "prev"));
  }

  return moved;
}
