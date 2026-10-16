"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { useState } from "react";

import { HubBannerGrid } from "@/features/home/ui/HubBannerGrid";
import {
  HUB_HAND_BOW_SRC,
  HUB_HAND_KAMANCHA_SRC,
} from "@/lib/brand/assets";
import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";
import {
  scheduleStateUpdate,
  useDeferredEffect,
} from "@/lib/react/schedule-after-paint";
import { useBodyScrollLock } from "@/lib/react/use-body-scroll-lock";

const HOLD_MS = 650;
const DONE_MS = 800;

const HERO_SIDE_W = 820;
const HERO_SIDE_H = 1024;

type Phase = "hold" | "leave" | "done";

const leaveTransition: Transition = {
  type: "spring",
  stiffness: 48,
  damping: 18,
  mass: 1.05,
};

type HubHandsIntroProps = {
  locale: Locale;
  labels: {
    restaurants: string;
    delivery: string;
    blog: string;
    fastFood: string;
  };
};

/**
 * Hub entrance: arms start on-screen, slide off, then cards stagger in.
 */
export function HubHandsIntro({ locale, labels }: HubHandsIntroProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("hold");
  const [instant, setInstant] = useState(false);

  useDeferredEffect(() => {
    if (reduceMotion) {
      scheduleStateUpdate(setInstant, true);
      scheduleStateUpdate(setPhase, "done");
      return;
    }

    const leaveTimer = window.setTimeout(() => {
      scheduleStateUpdate(setPhase, "leave");
    }, HOLD_MS);
    const doneTimer = window.setTimeout(() => {
      scheduleStateUpdate(setPhase, "done");
    }, HOLD_MS + DONE_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [reduceMotion]);

  const playing = phase !== "done";
  useBodyScrollLock(playing);

  const revealCards = phase === "done";

  return (
    <>
      {playing ? <IntroLayers leaving={phase === "leave"} /> : null}
      <HubBannerGrid
        locale={locale}
        labels={labels}
        reveal={revealCards}
        instant={instant}
      />
    </>
  );
}

function IntroLayers({ leaving }: { leaving: boolean }) {
  return (
    <>
      <DesktopHomeArms leaving={leaving} />
      <MobileHandsCurtain leaving={leaving} />
    </>
  );
}

function DesktopHomeArms({ leaving }: { leaving: boolean }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[120] hidden overflow-hidden xl:block"
      aria-hidden
    >
      <motion.div
        className="absolute top-0 left-0"
        initial={false}
        animate={leaving ? { x: "-100%", opacity: 1 } : { x: 0, opacity: 1 }}
        transition={leaveTransition}
      >
        <Image
          src={staticAssetUrl("/assets/brand/hero/hero-left.webp")}
          alt=""
          width={HERO_SIDE_W}
          height={HERO_SIDE_H}
          priority
          unoptimized
          className="h-auto w-[min(46vw,663px)] max-w-none object-contain object-left-top"
        />
      </motion.div>
      <motion.div
        className="absolute top-[6%] right-0"
        initial={false}
        animate={leaving ? { x: "100%", opacity: 1 } : { x: 0, opacity: 1 }}
        transition={leaveTransition}
      >
        <Image
          src={staticAssetUrl("/assets/brand/hero/hero-right.webp")}
          alt=""
          width={HERO_SIDE_W}
          height={HERO_SIDE_H}
          priority
          unoptimized
          className="h-auto w-[min(49vw,708px)] max-w-none object-contain object-right-top"
        />
      </motion.div>
    </div>
  );
}

function MobileHandsCurtain({ leaving }: { leaving: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-hidden bg-brand-forest xl:hidden"
      aria-hidden
      initial={false}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={leaveTransition}
      data-node-id="505:177"
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-[54%] w-full"
        initial={false}
        animate={leaving ? { y: "-108%" } : { y: 0 }}
        transition={leaveTransition}
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
        transition={leaveTransition}
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
