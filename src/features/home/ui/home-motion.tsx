"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

import {
  Reveal,
  Stagger,
  StaggerItem,
  revealEaseOut,
} from "@/components/ui/RevealMotion";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";

/** Soft ease — scroll reveals on the home page. */
export const homeEaseOut = revealEaseOut;

type HomeRevealProps = ComponentProps<typeof Reveal>;

/**
 * Scroll-into-view fade + rise for home sections.
 * Honors prefers-reduced-motion and locale-swap skip.
 */
export function HomeReveal({ enabled, ...rest }: HomeRevealProps) {
  const playMotion = usePlayHomeMotion();
  return <Reveal enabled={playMotion && (enabled ?? true)} {...rest} />;
}

type HomeStaggerProps = ComponentProps<typeof Stagger>;

/**
 * Parent for staggered scroll reveals. Pair with `HomeStaggerItem`.
 */
export function HomeStagger({ enabled, ...rest }: HomeStaggerProps) {
  const playMotion = usePlayHomeMotion();
  return <Stagger enabled={playMotion && (enabled ?? true)} {...rest} />;
}

type HomeStaggerItemProps = ComponentProps<typeof StaggerItem>;

/** Child of `HomeStagger`. */
export function HomeStaggerItem({ enabled, ...rest }: HomeStaggerItemProps) {
  const playMotion = usePlayHomeMotion();
  return <StaggerItem enabled={playMotion && (enabled ?? true)} {...rest} />;
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
