"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";

import {
  Reveal,
  scrollRevealViewport,
  Stagger,
  StaggerItem,
  revealEaseOut,
} from "@/components/ui/RevealMotion";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";

/** Soft ease — scroll reveals on the home page. */
export const homeEaseOut = revealEaseOut;

/**
 * Horizontal product/category rows — contain overscroll so vertical page scroll
 * is not captured; pan-x keeps cards from blocking vertical gestures.
 * `overflow-y-clip` avoids a stray vertical scrollbar track on the right.
 */
export const HOME_HORIZONTAL_SCROLL =
  "overflow-x-auto overflow-y-clip overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:size-0";

type HomeRevealProps = ComponentProps<typeof Reveal>;

/**
 * Scroll-into-view fade + rise for home sections.
 * Honors prefers-reduced-motion and locale-swap skip.
 */
export function HomeReveal({
  enabled,
  amount = scrollRevealViewport.amount,
  viewportMargin = scrollRevealViewport.viewportMargin,
  ...rest
}: HomeRevealProps) {
  const playMotion = usePlayHomeMotion();
  return (
    <Reveal
      enabled={playMotion && (enabled ?? true)}
      amount={amount}
      viewportMargin={viewportMargin}
      {...rest}
    />
  );
}

type HomeStaggerProps = ComponentProps<typeof Stagger>;

/** Parent for staggered scroll reveals. Pair with `HomeStaggerItem`. */
export function HomeStagger({
  enabled,
  amount = scrollRevealViewport.amount,
  viewportMargin = scrollRevealViewport.viewportMargin,
  ...rest
}: HomeStaggerProps) {
  const playMotion = usePlayHomeMotion();
  return (
    <Stagger
      enabled={playMotion && (enabled ?? true)}
      amount={amount}
      viewportMargin={viewportMargin}
      {...rest}
    />
  );
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
