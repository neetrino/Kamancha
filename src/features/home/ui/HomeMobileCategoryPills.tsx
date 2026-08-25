"use client";

import { animate, motion, useMotionValue, type MotionValue } from "motion/react";
import {
  useLayoutEffect,
  useRef,
  type MutableRefObject,
} from "react";

import { AppLink } from "@/components/ui/AppLink";
import {
  type HomeMobileCategorySlide,
  type WheelDirection,
} from "@/features/home/ui/HomeMobilePlateWheel";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";

const PILL_INSET_PX = 24;
const COPY_COUNT = 3;

/** Same spring as the plate wheel so pills step in sync. */
const PILL_SPRING = {
  type: "spring",
  stiffness: 52,
  damping: 18,
  mass: 0.95,
} as const;

type HomeMobileCategoryPillsProps = {
  categories: readonly HomeMobileCategorySlide[];
  index: number;
  direction: WheelDirection;
};

function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}

function stepsAlongDirection(
  from: number,
  to: number,
  length: number,
  direction: WheelDirection,
): number {
  if (from === to || length <= 0) {
    return 0;
  }
  if (direction === 1) {
    return wrapIndex(to - from, length);
  }
  return wrapIndex(from - to, length);
}

function middleSlot(slot: number, count: number): number {
  let next = slot;
  while (next < count) {
    next += count;
  }
  while (next >= count * 2) {
    next -= count;
  }
  return next;
}

function pillClassName(active: boolean): string {
  return `rounded-[50px] px-4 py-2 text-[16px] leading-6 whitespace-nowrap transition-colors ${
    active
      ? "bg-white font-semibold text-[rgba(34,34,34,0.9)]"
      : "bg-white/10 font-normal text-white/90 hover:bg-white/15"
  }`;
}

function translateForSlot(
  pillRefs: MutableRefObject<Array<HTMLElement | null>>,
  slot: number,
): number | null {
  const pill = pillRefs.current[slot];
  if (!pill) {
    return null;
  }
  return PILL_INSET_PX - pill.offsetLeft;
}

function useCircularPillTrack(
  pillRefs: MutableRefObject<Array<HTMLElement | null>>,
  index: number,
  count: number,
  direction: WheelDirection,
  playMotion: boolean,
  x: MotionValue<number>,
): void {
  const slotRef = useRef(count > 1 ? count + index : index);
  const prevIndexRef = useRef(index);
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    if (count <= 1) {
      x.set(0);
      return;
    }

    const prev = prevIndexRef.current;
    const isFirst = !mountedRef.current;

    if (isFirst) {
      slotRef.current = count + index;
      mountedRef.current = true;
    } else if (prev !== index) {
      const steps = stepsAlongDirection(prev, index, count, direction);
      slotRef.current += direction * steps;
    }
    prevIndexRef.current = index;

    const targetX = translateForSlot(pillRefs, slotRef.current);
    if (targetX == null) {
      return;
    }

    const play = playMotion && !isFirst && prev !== index;

    function snapToMiddleCopy(): void {
      const normalized = middleSlot(slotRef.current, count);
      if (normalized === slotRef.current) {
        return;
      }
      slotRef.current = normalized;
      const homeX = translateForSlot(pillRefs, normalized);
      if (homeX != null) {
        x.set(homeX);
      }
    }

    if (!play) {
      x.set(targetX);
      snapToMiddleCopy();
      return;
    }

    const controls = animate(x, targetX, {
      ...PILL_SPRING,
      onComplete: snapToMiddleCopy,
    });

    return () => {
      controls.stop();
    };
  }, [count, direction, index, pillRefs, playMotion, x]);
}

/**
 * Circular category pills — after the last item the first slides in from the left.
 */
export function HomeMobileCategoryPills({
  categories,
  index,
  direction,
}: HomeMobileCategoryPillsProps) {
  const playMotion = usePlayHomeMotion();
  const pillRefs = useRef<Array<HTMLElement | null>>([]);
  const x = useMotionValue(0);
  const count = categories.length;
  const copies = count > 1 ? COPY_COUNT : 1;

  useCircularPillTrack(pillRefs, index, count, direction, playMotion, x);

  return (
    <div
      data-node-id="196:205"
      className="overflow-x-hidden overflow-y-clip"
    >
      <motion.div
        className="flex w-max items-center gap-2 px-6"
        style={{ x }}
      >
        {Array.from({ length: copies }, (_, copy) =>
          categories.map((category, categoryIndex) => {
            const slot = copy * count + categoryIndex;
            const active = categoryIndex === index;
            const interactive = copies === 1 || copy === 1;
            const className = pillClassName(active);

            if (interactive) {
              return (
                <AppLink
                  key={`${copy}-${category.id}`}
                  ref={(node) => {
                    pillRefs.current[slot] = node;
                  }}
                  href={category.href}
                  prefetchPolicy="intent"
                  aria-current={active ? "page" : undefined}
                  className={className}
                >
                  {category.title}
                </AppLink>
              );
            }

            return (
              <span
                key={`${copy}-${category.id}`}
                ref={(node) => {
                  pillRefs.current[slot] = node;
                }}
                aria-hidden
                className={className}
              >
                {category.title}
              </span>
            );
          }),
        )}
      </motion.div>
    </div>
  );
}
