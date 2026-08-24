"use client";

import Image from "next/image";
import { motion, type Transition } from "motion/react";

import {
  Stagger,
  StaggerItem,
  scrollRevealViewport,
} from "@/components/ui/RevealMotion";
import {
  ABOUT_DRESS_IMAGE,
  ABOUT_RUG_IMAGE,
} from "@/features/about/content/about-assets";
import { HomeDiamondMark } from "@/features/home/ui/HomeDiamondMark";
import { usePlayHomeMotion } from "@/features/home/ui/use-play-home-motion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutStorySectionProps = {
  copy: Dictionary["about"];
};

const springCard: Transition = {
  type: "spring",
  stiffness: 55,
  damping: 18,
  mass: 0.95,
};

/**
 * Mobile story — dress on white panel above copy; rug at the bottom.
 */
function AboutStoryMobile({ copy, playMotion }: AboutStorySectionProps & { playMotion: boolean }) {
  return (
    <Stagger
      className="flex flex-col px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 min-[744px]:px-12 min-[834px]:px-16 min-[1024px]:px-20 xl:hidden"
      amount={scrollRevealViewport.amount}
      viewportMargin={scrollRevealViewport.viewportMargin}
      stagger={0.08}
      enabled={playMotion}
    >
      <StaggerItem className="relative z-[3] mx-auto -mt-24 w-full max-w-[280px] sm:-mt-28 sm:max-w-[320px]">
        <div
          data-node-id="362:295"
          className="relative aspect-[480/680] w-full overflow-hidden rounded-[20px]"
        >
          <Image
            src={ABOUT_DRESS_IMAGE}
            alt={copy.dressImageAlt}
            fill
            sizes="(max-width: 640px) 72vw, 320px"
            className="rounded-[20px] object-cover"
          />
        </div>
      </StaggerItem>

      <StaggerItem className="mt-8">
        <div className="flex flex-col gap-5 text-[#222]">
          <h2 className="font-big-fat-boii text-[clamp(22px,6.5vw,32px)] leading-[1.1] font-normal uppercase">
            {copy.title}
          </h2>
          <HomeDiamondMark tone="forest" className="h-[18px] w-[54px]" />
          <p className="text-[16px] leading-[26px]">{copy.intro}</p>
          <p className="text-[16px] leading-[26px]">{copy.introSecond}</p>
        </div>
      </StaggerItem>

      <StaggerItem className="mt-8">
        <div className="flex flex-col gap-5">
          <HomeDiamondMark tone="forest" className="h-[18px] w-[54px]" />
          <p className="text-[16px] leading-[26px] text-[#222]">{copy.intro}</p>
        </div>
      </StaggerItem>

      <StaggerItem className="mx-auto mt-8 w-full max-w-[531px]">
        <div
          data-node-id="362:358"
          className="relative aspect-[531/389] w-full overflow-hidden rounded-[20px]"
        >
          <Image
            src={ABOUT_RUG_IMAGE}
            alt={copy.rugImageAlt}
            fill
            sizes="90vw"
            className="object-cover object-center"
          />
        </div>
      </StaggerItem>
    </Stagger>
  );
}

/**
 * About story panel — Figma 362:284 absolute layout at 1440px.
 */
function AboutStoryDesktop({
  copy,
  playMotion,
}: AboutStorySectionProps & { playMotion: boolean }) {
  return (
    <Stagger
      className="relative mx-auto hidden min-h-[1040px] w-full max-w-[1440px] xl:block"
      amount={scrollRevealViewport.amount}
      viewportMargin={scrollRevealViewport.viewportMargin}
      stagger={0.08}
      enabled={playMotion}
    >
      <StaggerItem
        className="absolute top-[-79px] left-[111px] h-[680px] w-[480px] overflow-hidden rounded-[20px]"
        y={32}
      >
        <div data-node-id="362:295" className="relative size-full">
          <Image
            src={ABOUT_DRESS_IMAGE}
            alt={copy.dressImageAlt}
            fill
            sizes="480px"
            className="rounded-[20px] object-cover"
          />
        </div>
      </StaggerItem>

      <StaggerItem
        className="absolute top-[113px] left-[654px] w-auto max-w-none"
        y={22}
      >
        <h2
          data-node-id="362:296"
          className="font-big-fat-boii text-[32px] leading-[24px] font-normal whitespace-nowrap text-[#222] uppercase"
        >
          {copy.title}
        </h2>
      </StaggerItem>

      <StaggerItem
        className="absolute top-[190px] left-[654px] h-[18px] w-[54px]"
        y={18}
      >
        <HomeDiamondMark tone="forest" className="size-full" />
      </StaggerItem>

      <StaggerItem
        className="absolute top-[231px] left-[654px] w-[651px] text-[16px] leading-[26px] text-[#222]"
        y={24}
      >
        <p data-node-id="362:297">{copy.intro}</p>
      </StaggerItem>

      <StaggerItem
        className="absolute top-[414px] left-[654px] w-[651px] text-[16px] leading-[26px] text-[#222]"
        y={24}
      >
        <p data-node-id="362:298">{copy.introSecond}</p>
      </StaggerItem>

      <StaggerItem
        className="absolute top-[732px] left-[708px] h-[18px] w-[54px]"
        y={18}
      >
        <HomeDiamondMark tone="forest" className="size-full" />
      </StaggerItem>

      <StaggerItem
        className="absolute top-[761px] left-[111px] w-[651px] text-right text-[16px] leading-[26px] text-[#222]"
        y={24}
      >
        <p data-node-id="362:301">{copy.intro}</p>
      </StaggerItem>

      <StaggerItem
        className="absolute top-[603px] left-[822px] isolate h-[389px] w-[531px] overflow-hidden rounded-[20px]"
        y={32}
      >
        <div data-node-id="362:358" className="relative size-full">
          <Image
            src={ABOUT_RUG_IMAGE}
            alt={copy.rugImageAlt}
            fill
            sizes="531px"
            className="object-cover object-center"
          />
        </div>
      </StaggerItem>
    </Stagger>
  );
}

export function AboutStorySection({ copy }: AboutStorySectionProps) {
  const playMotion = usePlayHomeMotion();
  const instant: Transition = { duration: 0 };
  const panelTransition: Transition = playMotion
    ? { ...springCard, delay: 0.45 }
    : instant;

  return (
    <section
      data-node-id="362:284"
      className="relative left-1/2 z-[2] mt-16 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible sm:mt-20 xl:-mt-[420px]"
    >
      <motion.div
        className="relative w-full overflow-visible rounded-[30px] bg-white pb-10 sm:rounded-[40px] sm:pb-12 xl:rounded-[50px] xl:pb-10"
        initial={playMotion ? { opacity: 0, y: 36 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={panelTransition}
      >
        <AboutStoryMobile copy={copy} playMotion={playMotion} />
        <AboutStoryDesktop copy={copy} playMotion={playMotion} />
      </motion.div>
    </section>
  );
}
