"use client";

import { motion, type Transition } from "motion/react";
import type { ReactNode } from "react";

const CARD_STAGGER_S = 0.16;
const EDGE = "14%";

const springSoft: Transition = {
  type: "spring",
  stiffness: 48,
  damping: 18,
  mass: 1.05,
};

type HubStaggerItemProps = {
  index: number;
  from: "left" | "right";
  reveal: boolean;
  instant?: boolean;
  playFromHidden?: boolean;
  className: string;
  children: ReactNode;
};

/**
 * Hub-style edge entrance for a banner or venue tile.
 */
export function HubStaggerItem({
  index,
  from,
  reveal,
  instant = false,
  playFromHidden = false,
  className,
  children,
}: HubStaggerItemProps) {
  const hiddenX = from === "left" ? `-${EDGE}` : EDGE;
  const shown = { opacity: 1, x: "0%" };
  const hidden = { opacity: 0, x: hiddenX };
  const transition: Transition = instant
    ? { duration: 0 }
    : { ...springSoft, delay: index * CARD_STAGGER_S };

  return (
    <motion.div
      className={className}
      initial={playFromHidden ? hidden : false}
      animate={playFromHidden || reveal ? shown : hidden}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
