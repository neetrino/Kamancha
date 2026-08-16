"use client";

import Image from "next/image";
import { motion, type Transition } from "motion/react";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";

type HomeHeroProps = {
  brandName: string;
  ctaLabel: string;
  ctaHref: string;
};

const FIGMA_W = 1440;
const FIGMA_H = 926;
/** Pull hero content up under the transparent header. */
const Y_SHIFT = 100;

/** Figma export pixel size (82:177 / 22:208). */
const HERO_SIDE_W = 820;
const HERO_SIDE_H = 1024;

function topPct(figmaY: number): string {
  const y = Math.max(0, figmaY - Y_SHIFT);
  return `${(y / FIGMA_H) * 100}%`;
}

function heightPct(figmaH: number): string {
  return `${(figmaH / FIGMA_H) * 100}%`;
}

function widthPct(figmaW: number): string {
  return `${(figmaW / FIGMA_W) * 100}%`;
}

const springSoft: Transition = {
  type: "spring",
  stiffness: 48,
  damping: 18,
  mass: 1.05,
};

const springLogo: Transition = {
  type: "spring",
  stiffness: 42,
  damping: 20,
  mass: 1.1,
};

const springCta: Transition = {
  type: "spring",
  stiffness: 55,
  damping: 18,
  mass: 0.95,
};

/**
 * Kamancha home hero — Figma positions on 1440 artboard:
 * left 82:177 (663×828), wordmark 22:207 (590×283), right 22:208 (708×757), pill 22:435.
 * Side images pin to the viewport edges (same pattern as ContactHands).
 * Sides slide in; wordmark scales in the center; CTA rises last.
 * Locale switches skip the entrance and keep everything in place.
 */
export function HomeHero({ brandName, ctaLabel, ctaHref }: HomeHeroProps) {
  const playMotion = usePlayHomeMotion();

  const instant: Transition = { duration: 0 };
  const sideTransition = playMotion ? springSoft : instant;
  const logoTransition = playMotion
    ? { ...springLogo, delay: 0.45 }
    : instant;
  const ctaTransition = playMotion
    ? { ...springCta, delay: 1.15 }
    : instant;

  return (
    <section
      aria-label={brandName}
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 -mt-8 overflow-visible sm:-mt-10 md:-mt-12"
    >
      {/* Left — food platter (82:177), pinned to the viewport edge */}
      <motion.div
        className="pointer-events-none absolute top-0 left-0 z-[1] overflow-visible bg-transparent"
        data-node-id="82:177"
        initial={playMotion ? { opacity: 0, x: "-12%" } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={sideTransition}
      >
        <Image
          src="/assets/brand/hero/hero-left.webp"
          alt=""
          width={HERO_SIDE_W}
          height={HERO_SIDE_H}
          priority
          fetchPriority="high"
          unoptimized
          sizes="(min-width: 1440px) 663px, 46vw"
          className="h-auto w-[min(46vw,663px)] max-w-none bg-transparent object-contain object-left-top"
        />
      </motion.div>

      {/* Right — kamancha (22:208), pinned to the viewport edge */}
      <motion.div
        className="pointer-events-none absolute right-0 z-[3] overflow-visible bg-transparent"
        data-node-id="22:208"
        style={{ top: topPct(100) }}
        initial={playMotion ? { opacity: 0, x: "12%" } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={sideTransition}
      >
        <Image
          src="/assets/brand/hero/hero-right.webp"
          alt=""
          width={HERO_SIDE_W}
          height={HERO_SIDE_H}
          priority
          fetchPriority="high"
          unoptimized
          sizes="(min-width: 1440px) 708px, 49vw"
          className="h-auto w-[min(49vw,708px)] max-w-none bg-transparent object-contain object-right-top"
        />
      </motion.div>

      <div
        className="relative mx-auto w-full max-w-[1440px]"
        style={{
          aspectRatio: `${FIGMA_W} / ${FIGMA_H}`,
        }}
      >
        {/* Center wordmark (22:207): 590×283 */}
        <motion.div
          className="absolute z-[2] bg-transparent"
          style={{
            left: widthPct(461),
            top: topPct(258),
            width: widthPct(590),
            height: heightPct(283),
          }}
          initial={
            playMotion
              ? { opacity: 0, scale: 0.78, filter: "blur(5px)" }
              : false
          }
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{
            ...logoTransition,
            filter: playMotion
              ? { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.45 }
              : instant,
          }}
        >
          <Image
            src="/assets/brand/hero/hero-wordmark.svg"
            alt={brandName}
            fill
            priority
            unoptimized
            sizes="41vw"
            className="bg-transparent object-contain object-center"
          />
        </motion.div>

        {/* Menu CTA (22:435) */}
        <motion.div
          className="absolute z-[4] flex justify-center"
          style={{
            left: "50%",
            top: topPct(579),
            width: widthPct(280),
            x: "-50%",
          }}
          initial={playMotion ? { opacity: 0, y: 28 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={ctaTransition}
        >
          <KamanchaPillButton href={ctaHref} label={ctaLabel} />
        </motion.div>
      </div>
    </section>
  );
}
