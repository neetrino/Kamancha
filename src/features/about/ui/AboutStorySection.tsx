"use client";

import Image from "next/image";
import { motion, type Transition } from "motion/react";

import {
  Stagger,
  StaggerItem,
  scrollRevealViewport,
} from "@/components/ui/RevealMotion";
import {
  ABOUT_COUPLE_IMAGE,
  ABOUT_COUPLE_IMAGE_HEIGHT,
  ABOUT_COUPLE_IMAGE_WIDTH,
  ABOUT_FOUNDER_IMAGE,
  ABOUT_FOUNDER_IMAGE_HEIGHT,
  ABOUT_FOUNDER_IMAGE_WIDTH,
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
 * Mobile story — founder photo, title + bio, mission, couple photo.
 */
function AboutStoryMobile({
  copy,
  playMotion,
}: AboutStorySectionProps & { playMotion: boolean }) {
  return (
    <Stagger
      className="flex flex-col px-5 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8 min-[744px]:px-12 min-[834px]:px-16 min-[1024px]:px-20 xl:hidden"
      amount={scrollRevealViewport.amount}
      viewportMargin={scrollRevealViewport.viewportMargin}
      stagger={0.08}
      enabled={playMotion}
    >
      <StaggerItem className="relative z-[3] mx-auto w-full max-w-[572px]">
        <div
          data-node-id="423:149"
          className="relative aspect-[572/381] w-full overflow-hidden rounded-[20px] sm:rounded-[30px]"
        >
          <Image
            src={ABOUT_FOUNDER_IMAGE}
            alt={copy.founderImageAlt}
            fill
            sizes="(max-width: 640px) 90vw, 572px"
            className="rounded-[20px] object-cover sm:rounded-[30px]"
          />
        </div>
      </StaggerItem>

      <StaggerItem className="mt-8">
        <div className="flex flex-col gap-5 text-[#222]">
          <h2 className="font-big-fat-boii text-[clamp(22px,6.5vw,36px)] leading-[1.1] font-normal uppercase">
            {copy.title}
          </h2>
          <HomeDiamondMark tone="forest" className="h-[18px] w-[54px]" />
          <p className="text-[16px] leading-[26px]">{copy.founderBio}</p>
        </div>
      </StaggerItem>

      <StaggerItem className="mt-8">
        <div className="flex flex-col gap-5">
          <HomeDiamondMark tone="forest" className="h-[18px] w-[54px]" />
          <p className="text-[16px] leading-[26px] text-[#222]">{copy.mission}</p>
        </div>
      </StaggerItem>

      <StaggerItem className="mx-auto mt-8 w-full max-w-[493px]">
        <div
          data-node-id="423:148"
          className="relative aspect-[493/336] w-full overflow-hidden rounded-[20px] sm:rounded-[30px]"
        >
          <Image
            src={ABOUT_COUPLE_IMAGE}
            alt={copy.coupleImageAlt}
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
      className="relative mx-auto hidden min-h-[900px] w-full max-w-[1440px] xl:block"
      amount={scrollRevealViewport.amount}
      viewportMargin={scrollRevealViewport.viewportMargin}
      stagger={0.08}
      enabled={playMotion}
    >
      <StaggerItem
        className="absolute top-[95px] left-[53px] h-[381px] w-[572px] overflow-hidden rounded-[30px]"
        y={32}
      >
        <div data-node-id="423:149" className="relative size-full">
          <Image
            src={ABOUT_FOUNDER_IMAGE}
            alt={copy.founderImageAlt}
            width={ABOUT_FOUNDER_IMAGE_WIDTH}
            height={ABOUT_FOUNDER_IMAGE_HEIGHT}
            sizes="572px"
            className="size-full rounded-[30px] object-cover"
          />
        </div>
      </StaggerItem>

      <StaggerItem
        className="absolute top-[113px] left-[664px] w-auto max-w-none"
        y={22}
      >
        <h2
          data-node-id="362:296"
          className="font-big-fat-boii text-[36px] leading-[24px] font-normal whitespace-nowrap text-[#222] uppercase"
        >
          {copy.title}
        </h2>
      </StaggerItem>

      <StaggerItem
        className="absolute top-[190px] left-[664px] h-[18px] w-[54px]"
        y={18}
      >
        <HomeDiamondMark tone="forest" className="size-full" />
      </StaggerItem>

      <StaggerItem
        className="absolute top-[231px] left-[664px] w-[651px] text-[16px] leading-[26px] text-[#222]"
        y={24}
      >
        <p data-node-id="362:297">{copy.founderBio}</p>
      </StaggerItem>

      <StaggerItem
        className="absolute top-[578px] left-[700px] h-[18px] w-[54px]"
        y={18}
      >
        <HomeDiamondMark tone="forest" className="size-full" />
      </StaggerItem>

      <StaggerItem
        className="absolute top-[607px] left-[103px] w-[651px] text-right text-[16px] leading-[26px] text-[#222]"
        y={24}
      >
        <p data-node-id="362:301">{copy.mission}</p>
      </StaggerItem>

      <StaggerItem
        className="absolute top-[476px] left-[822px] isolate h-[336px] w-[493px] overflow-hidden rounded-[30px]"
        y={32}
      >
        <div data-node-id="423:148" className="relative size-full">
          <Image
            src={ABOUT_COUPLE_IMAGE}
            alt={copy.coupleImageAlt}
            width={ABOUT_COUPLE_IMAGE_WIDTH}
            height={ABOUT_COUPLE_IMAGE_HEIGHT}
            sizes="493px"
            className="size-full rounded-[30px] object-cover object-center"
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
        className="relative w-full overflow-visible rounded-[30px] bg-white pb-10 sm:rounded-[40px] sm:pb-12 xl:rounded-[50px] xl:pb-16"
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
