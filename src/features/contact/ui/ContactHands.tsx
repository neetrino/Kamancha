"use client";

import Image from "next/image";
import { motion, type Transition } from "motion/react";

import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";
import {
  CONTACT_HAND_PARCHMENT_SRC,
  CONTACT_HAND_QUILL_SRC,
} from "@/lib/brand/assets";

const springSoft: Transition = {
  type: "spring",
  stiffness: 48,
  damping: 18,
  mass: 1.05,
};

type ContactHandsProps = {
  /** Nudge the parchment hand down (login only). */
  lowerLeft?: boolean;
  /** Nudge the parchment hand up (contact only). */
  raiseLeft?: boolean;
};

function leftHandTopClass(lowerLeft: boolean, raiseLeft: boolean): string {
  if (lowerLeft) return "-top-24";
  if (raiseLeft) return "-top-36";
  return "-top-30";
}

/**
 * Flanking parchment and quill hands — Figma 244:509 / 251:510.
 */
export function ContactHands({
  lowerLeft = false,
  raiseLeft = false,
}: ContactHandsProps) {
  const playMotion = usePlayHomeMotion();
  const sideTransition: Transition = playMotion ? springSoft : { duration: 0 };

  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-4 z-0 hidden h-[720px] overflow-visible sm:top-6 lg:block"
        aria-hidden
        initial={playMotion ? { opacity: 0, x: "-12%" } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={sideTransition}
      >
        <Image
          src={CONTACT_HAND_PARCHMENT_SRC}
          alt=""
          width={540}
          height={719}
          className={`absolute left-0 h-auto w-[min(42vw,560px)] max-w-none object-contain object-left-top ${leftHandTopClass(lowerLeft, raiseLeft)}`}
          data-node-id="244:509"
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-4 z-[2] hidden h-[720px] overflow-visible sm:top-6 lg:block"
        aria-hidden
        initial={playMotion ? { opacity: 0, x: "12%" } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={sideTransition}
      >
        <Image
          src={CONTACT_HAND_QUILL_SRC}
          alt=""
          width={510}
          height={604}
          className="absolute top-28 right-0 h-auto w-[min(40vw,530px)] max-w-none object-contain object-right-top"
          data-node-id="251:510"
        />
      </motion.div>
    </>
  );
}
