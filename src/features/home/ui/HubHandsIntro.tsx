"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { useState } from "react";

import {
  HUB_HAND_BOW_SRC,
  HUB_HAND_KAMANCHA_SRC,
} from "@/lib/brand/assets";
import {
  scheduleStateUpdate,
  useDeferredEffect,
} from "@/lib/react/schedule-after-paint";
import { useBodyScrollLock } from "@/lib/react/use-body-scroll-lock";

const SESSION_KEY = "kamancha-hub-hands-opened";
const HOLD_CLOSED_MS = 700;
const OPEN_MS = 1100;
const FADE_MS = 280;

const openTransition: Transition = {
  duration: OPEN_MS / 1000,
  ease: [0.22, 1, 0.36, 1],
};

type Phase = "closed" | "open" | "done";

function readOpened(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markOpened(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // ignore
  }
}

/**
 * Green hands curtain (Figma 505:177) that slides away to reveal the hub.
 */
export function HubHandsIntro() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");

  useDeferredEffect(() => {
    if (reduceMotion || readOpened()) {
      scheduleStateUpdate(setPhase, "done");
      return;
    }

    const openTimer = window.setTimeout(() => {
      markOpened();
      scheduleStateUpdate(setPhase, "open");
    }, HOLD_CLOSED_MS);
    const doneTimer = window.setTimeout(() => {
      scheduleStateUpdate(setPhase, "done");
    }, HOLD_CLOSED_MS + OPEN_MS + FADE_MS);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(doneTimer);
    };
  }, [reduceMotion]);

  const visible = phase !== "done";
  useBodyScrollLock(visible);

  if (!visible) {
    return null;
  }

  return <HandsCurtain leaving={phase === "open"} />;
}

function HandsCurtain({ leaving }: { leaving: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-hidden bg-brand-forest"
      aria-hidden
      initial={false}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={openTransition}
      data-node-id="505:177"
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-[54%] w-full"
        initial={false}
        animate={leaving ? { y: "-108%" } : { y: 0 }}
        transition={openTransition}
      >
        <Image
          src={HUB_HAND_KAMANCHA_SRC}
          alt=""
          width={820}
          height={1024}
          priority
          className="h-full w-full object-cover object-top"
          data-node-id="505:601"
        />
      </motion.div>
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[58%] w-full"
        initial={false}
        animate={leaving ? { y: "108%" } : { y: 0 }}
        transition={openTransition}
      >
        <Image
          src={HUB_HAND_BOW_SRC}
          alt=""
          width={679}
          height={848}
          priority
          className="h-full w-full object-cover object-left-bottom"
          data-node-id="505:172"
        />
      </motion.div>
    </motion.div>
  );
}
