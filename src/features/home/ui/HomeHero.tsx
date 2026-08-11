"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "motion/react";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";

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
 */
export function HomeHero({ brandName, ctaLabel, ctaHref }: HomeHeroProps) {
  const reduceMotion = useReducedMotion();

  const instant: Transition = { duration: 0 };
  const sideTransition = reduceMotion ? instant : springSoft;
  const logoTransition = reduceMotion ? instant : { ...springLogo, delay: 0.45 };
  const ctaTransition = reduceMotion ? instant : { ...springCta, delay: 1.15 };

  return (
    <section
      aria-label={brandName}
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 -mt-8 overflow-visible sm:-mt-10 md:-mt-12"
    >
      <div
        className="relative mx-auto w-full"
        style={{
          maxWidth: "min(100%, calc(820px * 1440 / 708))",
          aspectRatio: `${FIGMA_W} / ${FIGMA_H}`,
        }}
      >
        {/* Left — food platter (Figma 82:177): 0,98 / 663×828 */}
        <motion.div
          className="pointer-events-none absolute z-[1]"
          data-node-id="82:177"
          style={{
            left: 0,
            top: topPct(98),
            width: widthPct(663),
            height: heightPct(828),
          }}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, x: "-12%" }
          }
          animate={{ opacity: 1, x: 0 }}
          transition={sideTransition}
        >
          <Image
            src="/assets/brand/hero/hero-left.webp"
            alt=""
            width={HERO_SIDE_W}
            height={HERO_SIDE_H}
            priority
            unoptimized
            sizes="(min-width: 1440px) 663px, 46vw"
            className="h-full w-full max-w-none object-contain object-left-top"
          />
        </motion.div>

        {/* Right — kamancha (22:208): 732,141 / 708×757 */}
        <motion.div
          className="pointer-events-none absolute z-[3]"
          data-node-id="22:208"
          style={{
            left: widthPct(732),
            top: topPct(141),
            width: widthPct(708),
            height: heightPct(757),
          }}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, x: "12%" }
          }
          animate={{ opacity: 1, x: 0 }}
          transition={sideTransition}
        >
          <Image
            src="/assets/brand/hero/hero-right.webp"
            alt=""
            width={HERO_SIDE_W}
            height={HERO_SIDE_H}
            priority
            unoptimized
            sizes="(min-width: 1440px) 708px, 49vw"
            className="h-full w-full max-w-none object-contain object-right-top"
          />
        </motion.div>

        {/* Center wordmark (22:207): 590×283 */}
        <motion.div
          className="absolute z-[2]"
          style={{
            left: widthPct(461),
            top: topPct(258),
            width: widthPct(590),
            height: heightPct(283),
          }}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, scale: 0.78, filter: "blur(5px)" }
          }
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{
            ...logoTransition,
            filter: reduceMotion
              ? instant
              : { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.45 },
          }}
        >
          <Image
            src="/assets/brand/hero/hero-wordmark.svg"
            alt={brandName}
            fill
            priority
            unoptimized
            sizes="41vw"
            className="object-contain object-center"
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
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 28 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={ctaTransition}
        >
          <KamanchaPillButton href={ctaHref} label={ctaLabel} />
        </motion.div>
      </div>
    </section>
  );
}
