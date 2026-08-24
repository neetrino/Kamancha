import Image from "next/image";

import { SITE_HEADER_INNER } from "@/components/layout/site-header-classes";
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
      <div className="relative mx-auto w-full max-w-[1440px] lg:min-h-[1180px]">
        <div
          className={`${SITE_HEADER_INNER} relative z-[1] pt-2 pb-8 sm:pt-4 lg:pt-[108px] lg:pb-32`}
        >
          <div className="max-w-[777px]">
            <h1 className="font-big-fat-boii text-[clamp(36px,5.2vw,68px)] leading-[1.05] font-normal text-[#e5e2e1] uppercase lg:whitespace-nowrap">
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
        </div>

        {/* Hero portrait — 887×1774, title aligned with head via lg:pt-[108px] */}
        <div
          data-node-id="362:282"
          className="relative mx-auto mt-2 aspect-[887/1774] w-full max-w-[820px] sm:max-w-[960px] lg:pointer-events-none lg:absolute lg:-top-[100px] lg:right-[-355px] lg:z-0 lg:mx-0 lg:mt-0 lg:aspect-auto lg:h-[min(215vh,2840px)] lg:w-[1480px] lg:max-w-none"
        >
          <Image
            src={ABOUT_HERO_IMAGE}
            alt={copy.heroImageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 95vw, 1480px"
            className="object-contain object-bottom lg:object-top"
          />
        </div>
      </div>
    </section>
  );
}
