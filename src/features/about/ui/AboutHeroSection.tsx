import Image from "next/image";

import { ABOUT_HERO_IMAGE } from "@/features/about/content/about-assets";
import { HomeDiamondMark } from "@/features/home/ui/HomeDiamondMark";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutHeroSectionProps = {
  copy: Dictionary["about"];
};

/**
 * About hero — Figma 362:289–362:291 with kamancha portrait 362:282.
 */
export function AboutHeroSection({ copy }: AboutHeroSectionProps) {
  return (
    <section
      data-node-id="362:289"
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible"
    >
      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:min-h-[780px] lg:px-[63px]">
        <div className="relative z-[1] max-w-[777px] pt-2 pb-8 sm:pt-4 lg:pt-[72px] lg:pb-32">
          <h1 className="font-big-fat-boii text-[clamp(36px,5.3vw,76px)] leading-[1.05] font-normal text-[#e5e2e1] uppercase">
            {copy.title}
          </h1>

          <HomeDiamondMark
            tone="light"
            className="mt-6 h-[18px] w-[54px] sm:mt-8"
          />

          <p
            data-node-id="362:290"
            className="mt-8 max-w-[777px] text-[16px] leading-[26px] text-[#c2c9bd] sm:mt-10"
          >
            {copy.intro}
          </p>

          <p
            data-node-id="362:291"
            className="mt-6 max-w-[650px] text-[16px] leading-[26px] text-[#c2c9bd]"
          >
            {copy.introSecond}
          </p>
        </div>

        {/* Figma 362:282 — 933×1877, object-bottom, overflows right by 55px at 1440 */}
        <div
          data-node-id="362:282"
          className="relative mx-auto mt-2 aspect-[933/1877] w-full max-w-[420px] sm:max-w-[480px] lg:pointer-events-none lg:absolute lg:top-0 lg:right-[-55px] lg:mx-0 lg:mt-0 lg:aspect-auto lg:h-[min(130vh,1877px)] lg:w-[933px] lg:max-w-none"
        >
          <Image
            src={ABOUT_HERO_IMAGE}
            alt={copy.heroImageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 933px"
            className="object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
