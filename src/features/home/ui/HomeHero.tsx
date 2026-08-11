import Image from "next/image";

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

/**
 * Kamancha home hero — Figma positions on 1440 artboard:
 * left 82:177 (663×828), wordmark 22:207 (590×283), right 22:208 (708×757), pill 22:435.
 */
export function HomeHero({ brandName, ctaLabel, ctaHref }: HomeHeroProps) {
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
        <div
          className="pointer-events-none absolute z-[1]"
          data-node-id="82:177"
          style={{
            left: 0,
            top: topPct(98),
            width: widthPct(663),
            height: heightPct(828),
          }}
        >
          <Image
            src="/assets/brand/hero/hero-left.png?v=7"
            alt=""
            width={HERO_SIDE_W}
            height={HERO_SIDE_H}
            priority
            unoptimized
            sizes="(min-width: 1440px) 663px, 46vw"
            className="h-full w-full max-w-none object-contain object-left-top"
          />
        </div>

        {/* Right — kamancha (22:208): 732,141 / 708×757 */}
        <div
          className="pointer-events-none absolute z-[3]"
          data-node-id="22:208"
          style={{
            left: widthPct(732),
            top: topPct(141),
            width: widthPct(708),
            height: heightPct(757),
          }}
        >
          <Image
            src="/assets/brand/hero/hero-right.png?v=7"
            alt=""
            width={HERO_SIDE_W}
            height={HERO_SIDE_H}
            priority
            unoptimized
            sizes="(min-width: 1440px) 708px, 49vw"
            className="h-full w-full max-w-none object-contain object-right-top"
          />
        </div>

        {/* Center wordmark (22:207): 590×283 */}
        <div
          className="absolute z-[2]"
          style={{
            left: widthPct(461),
            top: topPct(258),
            width: widthPct(590),
            height: heightPct(283),
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
        </div>

        {/* Menu CTA (22:435) */}
        <div
          className="absolute left-1/2 z-[4] flex -translate-x-1/2 justify-center"
          style={{
            top: topPct(579),
            width: widthPct(280),
          }}
        >
          <KamanchaPillButton href={ctaHref} label={ctaLabel} />
        </div>
      </div>
    </section>
  );
}
