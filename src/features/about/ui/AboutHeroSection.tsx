"use client";

import Image from "next/image";
import { motion, type Transition } from "motion/react";

import { SITE_HEADER_INNER } from "@/components/layout/site-header-classes";
import {
  Stagger,
  StaggerItem,
} from "@/components/ui/RevealMotion";
import {
  ABOUT_HERO_IMAGE,
  ABOUT_HERO_IMAGE_HEIGHT,
  ABOUT_HERO_IMAGE_WIDTH,
} from "@/features/about/content/about-assets";
import { HomeDiamondMark } from "@/features/home/ui/HomeDiamondMark";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutHeroSectionProps = {
  copy: Dictionary["about"];
};

const springSoft: Transition = {
  type: "spring",
  stiffness: 48,
  damping: 18,
  mass: 1.05,
};

/**
 * About hero — Figma 362:289–362:291 with cropped portrait 362:282 (887×1774).
 */
export function AboutHeroSection({ copy }: AboutHeroSectionProps) {
  const playMotion = usePlayHomeMotion();
  const instant: Transition = { duration: 0 };
  const sideTransition: Transition = playMotion ? springSoft : instant;

  return (
    <section
      data-node-id="362:289"
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible"
    >
      <div className="relative mx-auto w-full max-w-[1440px] xl:min-h-[1180px]">
        <div
          className={`${SITE_HEADER_INNER} relative z-[1] pt-2 pb-10 sm:pt-4 sm:pb-12 min-[744px]:max-xl:px-12 min-[834px]:max-xl:px-16 min-[1024px]:max-xl:px-20 xl:pt-[108px] xl:pb-32`}
        >
          <Stagger
            className="max-w-[777px]"
            immediate
            enabled={playMotion}
            stagger={0.09}
          >
            <StaggerItem>
              <h1 className="font-big-fat-boii text-[clamp(36px,5.2vw,68px)] leading-[1.05] font-normal text-[#e5e2e1] uppercase xl:whitespace-nowrap">
                {copy.title}
              </h1>
            </StaggerItem>

            <StaggerItem y={18}>
              <HomeDiamondMark
                tone="light"
                className="mt-6 h-[18px] w-[54px] sm:mt-8"
              />
            </StaggerItem>

            <StaggerItem>
              <p
                data-node-id="362:290"
                className="mt-8 max-w-[777px] text-[16px] leading-[26px] text-[#c2c9bd] sm:mt-10"
              >
                {copy.intro}
              </p>
            </StaggerItem>

            <StaggerItem>
              <p
                data-node-id="362:291"
                className="mt-6 max-w-[650px] text-[16px] leading-[26px] text-[#c2c9bd]"
              >
                {copy.introSecond}
              </p>
            </StaggerItem>
          </Stagger>
        </div>

        {/* Figma 362:282 — desktop only; hidden on mobile storefront. */}
        <motion.div
          data-node-id="362:282"
          className="relative mx-auto hidden w-full max-w-[420px] sm:max-w-[480px] xl:pointer-events-none xl:absolute xl:-top-[100px] xl:right-[-55px] xl:z-0 xl:mx-0 xl:mt-0 xl:block xl:w-[887px] xl:max-w-none"
          initial={playMotion ? { opacity: 0, x: "12%" } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={sideTransition}
        >
          <Image
            src={ABOUT_HERO_IMAGE}
            alt={copy.heroImageAlt}
            width={ABOUT_HERO_IMAGE_WIDTH}
            height={ABOUT_HERO_IMAGE_HEIGHT}
            priority
            sizes="(max-width: 1024px) 90vw, 887px"
            className="h-auto w-full object-bottom"
          />
        </motion.div>
      </div>
    </section>
  );
}
