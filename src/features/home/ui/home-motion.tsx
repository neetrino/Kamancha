"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
} from "motion/react";
import type { ReactNode } from "react";

/** Soft ease — scroll reveals on the home page. */
export const homeEaseOut: Transition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

type HomeRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  once?: boolean;
  amount?: number;
} & Omit<
  HTMLMotionProps<"div">,
  "children" | "initial" | "animate" | "whileInView"
>;

/**
 * Scroll-into-view fade + rise for home sections.
 * Honors prefers-reduced-motion.
 */
export function HomeReveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 0,
  once = true,
  amount = 0.2,
  ...rest
}: HomeRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, amount, margin: "0px 0px -8% 0px" }}
      transition={{ ...homeEaseOut, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

type HomeStaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
};

/**
 * Parent for staggered scroll reveals. Pair with `HomeStaggerItem`.
 */
export function HomeStagger({
  children,
  className,
  stagger = 0.09,
  amount = 0.12,
}: HomeStaggerProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: "0px 0px -6% 0px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: 0.05 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type HomeStaggerItemProps = {
  children: ReactNode;
  className?: string;
};

const staggerItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 },
};

/** Child of `HomeStagger`. */
export function HomeStaggerItem({ children, className }: HomeStaggerItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerItem}
      transition={homeEaseOut}
    >
      {children}
    </motion.div>
  );
}

type HomeFloatProps = {
  children: ReactNode;
  className?: string;
  /** Peak vertical drift in px. */
  amplitude?: number;
  duration?: number;
};

/**
 * Subtle ambient float for decorative media (rugs, ornaments).
 * Disabled when prefers-reduced-motion.
 */
export function HomeFloat({
  children,
  className,
  amplitude = 10,
  duration = 5.5,
}: HomeFloatProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
