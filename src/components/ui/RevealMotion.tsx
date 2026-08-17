"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from "motion/react";
import type { ReactNode } from "react";

/** Soft ease shared by storefront scroll / entrance reveals. */
export const revealEaseOut: Transition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  once?: boolean;
  amount?: number;
  /** Play on mount instead of waiting for the viewport. */
  immediate?: boolean;
  /**
   * When false, animates transform only. Use over `backdrop-filter` / liquid-glass
   * — parent opacity breaks glass sampling until the fade finishes.
   */
  fade?: boolean;
  /** Extra gate (e.g. skip after locale swap). Reduced motion always wins. */
  enabled?: boolean;
} & Omit<
  HTMLMotionProps<"div">,
  "children" | "initial" | "animate" | "whileInView"
>;

function usePlayReveal(enabled: boolean): boolean {
  const reduceMotion = useReducedMotion();
  return enabled && !reduceMotion;
}

/**
 * Fade + rise when the block enters the viewport.
 * Honors prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  once = true,
  amount = 0.2,
  immediate = false,
  fade = true,
  enabled = true,
  ...rest
}: RevealProps) {
  const play = usePlayReveal(enabled);
  const shown = fade ? { opacity: 1, y: 0, x: 0 } : { y: 0, x: 0 };
  const hidden = play
    ? fade
      ? { opacity: 0, y, x }
      : { y, x }
    : false;

  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={play && immediate ? shown : undefined}
      whileInView={play && !immediate ? shown : undefined}
      viewport={
        play && !immediate
          ? { once, amount, margin: "0px 0px -8% 0px" }
          : undefined
      }
      transition={play ? { ...revealEaseOut, delay } : undefined}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
  immediate?: boolean;
  enabled?: boolean;
};

/**
 * Parent for staggered scroll reveals. Pair with `StaggerItem`.
 */
export function Stagger({
  children,
  className,
  stagger = 0.09,
  amount = 0.12,
  immediate = false,
  enabled = true,
}: StaggerProps) {
  const play = usePlayReveal(enabled);

  return (
    <motion.div
      className={className}
      initial={play ? "hidden" : false}
      animate={play && immediate ? "show" : undefined}
      whileInView={play && !immediate ? "show" : undefined}
      viewport={
        play && !immediate
          ? { once: true, amount, margin: "0px 0px -6% 0px" }
          : undefined
      }
      variants={
        play
          ? {
              hidden: {},
              show: {
                transition: { staggerChildren: stagger, delayChildren: 0.05 },
              },
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  enabled?: boolean;
};

const staggerItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 },
};

/** Child of `Stagger`. */
export function StaggerItem({
  children,
  className,
  enabled = true,
}: StaggerItemProps) {
  const play = usePlayReveal(enabled);

  return (
    <motion.div
      className={className}
      variants={play ? staggerItem : undefined}
      transition={play ? revealEaseOut : undefined}
    >
      {children}
    </motion.div>
  );
}
