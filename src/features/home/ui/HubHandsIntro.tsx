"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState } from "react";

import { isHubHomePath, isReturningToHub } from "@/features/home/hub-experience-path";
import { writeHubIntroState } from "@/features/home/hub-intro-document";
import {
  captureHubReturnSkipArms,
  isPendingDeliveryNavbarDrop,
  peekStorefrontPathname,
} from "@/features/home/storefront-path-memory";
import {
  HUB_INTRO_DONE_MS,
  HUB_INTRO_HOLD_MS,
  HUB_INTRO_SPRING,
} from "@/features/home/hub-intro-timing";
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

const HERO_SIDE_W = 820;
const HERO_SIDE_H = 1024;

type Phase = "hold" | "leave" | "done";

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
  const pathname = usePathname() ?? `/${locale}`;
  const reduceMotion = useReducedMotion();
  const skipArms = captureHubReturnSkipArms(
    isReturningToHub(pathname, locale, peekStorefrontPathname()),
    isHubHomePath(pathname, locale),
  );
  const [phase, setPhase] = useState<Phase>("hold");
  const [instant, setInstant] = useState(false);

  useLayoutEffect(() => {
    if (reduceMotion || skipArms) {
      writeHubIntroState("done");
      return;
    }
    writeHubIntroState(phase === "done" ? "done" : "playing");
    return () => {
      if (!isPendingDeliveryNavbarDrop()) {
        writeHubIntroState("done");
      }
    };
  }, [phase, reduceMotion, skipArms]);

  useDeferredEffect(() => {
    if (reduceMotion) {
      scheduleStateUpdate(setInstant, true);
      scheduleStateUpdate(setPhase, "done");
      return;
    }

    if (skipArms) {
      scheduleStateUpdate(setPhase, "done");
      return;
    }

    const leaveTimer = window.setTimeout(() => {
      scheduleStateUpdate(setPhase, "leave");
    }, HUB_INTRO_HOLD_MS);
    const doneTimer = window.setTimeout(() => {
      scheduleStateUpdate(setPhase, "done");
    }, HUB_INTRO_HOLD_MS + HUB_INTRO_DONE_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [reduceMotion, skipArms]);

  const playing = !skipArms && phase !== "done";
  useBodyScrollLock(playing);

  const revealCards = phase === "done";

  return (
    <>
      {playing ? <IntroLayers leaving={phase === "leave"} /> : null}
      <HubBannerGrid
        locale={locale}
        labels={labels}
        reveal={skipArms || revealCards}
        instant={instant}
        playFromHidden={skipArms}
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
        transition={HUB_INTRO_SPRING}
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
        transition={HUB_INTRO_SPRING}
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
      transition={HUB_INTRO_SPRING}
      data-node-id="505:177"
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-[54%] w-full"
        initial={false}
        animate={leaving ? { y: "-108%" } : { y: 0 }}
        transition={HUB_INTRO_SPRING}
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
        transition={HUB_INTRO_SPRING}
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
