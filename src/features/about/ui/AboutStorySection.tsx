import Image from "next/image";

import {
  ABOUT_DRESS_IMAGE,
  ABOUT_RUG_IMAGE,
} from "@/features/about/content/about-assets";
import { HomeDiamondMark } from "@/features/home/ui/HomeDiamondMark";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutStorySectionProps = {
  copy: Dictionary["about"];
};

function AboutStoryMobile({ copy }: AboutStorySectionProps) {
  return (
    <div className="px-5 py-10 sm:px-8 sm:py-12 lg:hidden">
      <div className="relative -mt-16 mb-8">
        <div
          data-node-id="362:295"
          className="relative mx-auto aspect-[480/680] w-full max-w-[480px] overflow-hidden rounded-[20px]"
        >
          <Image
            src={ABOUT_DRESS_IMAGE}
            alt={copy.dressImageAlt}
            fill
            sizes="90vw"
            className="rounded-[20px] object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 text-[#222]">
        <h2 className="font-big-fat-boii text-[clamp(22px,6.5vw,32px)] leading-[1.1] font-normal uppercase sm:whitespace-nowrap">
          {copy.title}
        </h2>
        <HomeDiamondMark tone="forest" className="h-[18px] w-[54px]" />
        <p className="text-[16px] leading-[26px]">{copy.intro}</p>
        <p className="text-[16px] leading-[26px]">{copy.introSecond}</p>
      </div>

      <div className="mt-10 flex flex-col gap-5">
        <HomeDiamondMark tone="forest" className="h-[18px] w-[54px]" />
        <p className="text-[16px] leading-[26px] text-[#222]">{copy.intro}</p>
      </div>

      <div
        data-node-id="362:358"
        className="relative mx-auto mt-8 aspect-[531/389] w-full max-w-[531px] isolate overflow-hidden rounded-[20px]"
      >
        <Image
          src={ABOUT_RUG_IMAGE}
          alt={copy.rugImageAlt}
          fill
          sizes="90vw"
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}

/**
 * About story panel — Figma 362:284 absolute layout at 1440px.
 */
function AboutStoryDesktop({ copy }: AboutStorySectionProps) {
  return (
    <div className="relative mx-auto hidden min-h-[1040px] w-full max-w-[1440px] lg:block">
      <div
        data-node-id="362:295"
        className="absolute top-[-79px] left-[111px] h-[680px] w-[480px] overflow-hidden rounded-[20px]"
      >
        <Image
          src={ABOUT_DRESS_IMAGE}
          alt={copy.dressImageAlt}
          fill
          sizes="480px"
          className="rounded-[20px] object-cover"
        />
      </div>

      <h2
        data-node-id="362:296"
        className="absolute top-[113px] left-[654px] w-auto max-w-none font-big-fat-boii text-[32px] leading-[24px] font-normal whitespace-nowrap text-[#222] uppercase"
      >
        {copy.title}
      </h2>

      <HomeDiamondMark
        tone="forest"
        className="absolute top-[190px] left-[654px] h-[18px] w-[54px]"
      />

      <p
        data-node-id="362:297"
        className="absolute top-[231px] left-[654px] w-[651px] text-[16px] leading-[26px] text-[#222]"
      >
        {copy.intro}
      </p>

      <p
        data-node-id="362:298"
        className="absolute top-[414px] left-[654px] w-[651px] text-[16px] leading-[26px] text-[#222]"
      >
        {copy.introSecond}
      </p>

      <HomeDiamondMark
        tone="forest"
        className="absolute top-[732px] left-[708px] h-[18px] w-[54px]"
      />

      <p
        data-node-id="362:301"
        className="absolute top-[761px] left-[111px] w-[651px] text-right text-[16px] leading-[26px] text-[#222]"
      >
        {copy.intro}
      </p>

      <div
        data-node-id="362:358"
        className="absolute top-[603px] left-[822px] isolate h-[389px] w-[531px] overflow-hidden rounded-[20px]"
      >
        <Image
          src={ABOUT_RUG_IMAGE}
          alt={copy.rugImageAlt}
          fill
          sizes="531px"
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}

export function AboutStorySection({ copy }: AboutStorySectionProps) {
  return (
    <section
      data-node-id="362:284"
      className="relative left-1/2 z-[2] -mt-28 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible sm:-mt-40 lg:-mt-[420px]"
    >
      <div className="w-full overflow-visible rounded-[30px] bg-white pb-10 sm:rounded-[40px] sm:pb-12 lg:rounded-[50px] lg:pb-10">
        <AboutStoryMobile copy={copy} />
        <AboutStoryDesktop copy={copy} />
      </div>
    </section>
  );
}
