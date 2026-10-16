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
      <MobileHomeArms leaving={leaving} />
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

function MobileHomeArms({ leaving }: { leaving: boolean }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[120] overflow-hidden xl:hidden"
      aria-hidden
    >
      <motion.div
        className="absolute top-0 right-0"
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
          className="h-auto w-[min(88vw,708px)] max-w-none object-contain object-right-top"
        />
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0"
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
          className="h-auto w-[min(88vw,663px)] max-w-none object-contain object-left-bottom"
        />
      </motion.div>
    </div>
  );
}
