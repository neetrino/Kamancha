"use client";

import { motion, type Transition } from "motion/react";
import type { ReactNode } from "react";

import { HubBannerCard } from "@/features/home/ui/HubBannerCard";
import { RestormaniaHubMark } from "@/features/home/ui/RestormaniaHubMark";
import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const HUB = "/assets/brand/hub";
const CARD_STAGGER_S = 0.16;
const EDGE = "14%";

type HubBannerGridProps = {
  locale: Locale;
  labels: {
    restaurants: string;
    delivery: string;
    blog: string;
    fastFood: string;
  };
  reveal?: boolean;
  instant?: boolean;
};

function staggerTransition(index: number, instant: boolean): Transition {
  if (instant) {
    return { duration: 0 };
  }

  return {
    type: "spring",
    stiffness: 48,
    damping: 18,
    mass: 1.05,
    delay: index * CARD_STAGGER_S,
  };
}

function HubStaggerItem({
  index,
  from,
  reveal,
  instant,
  className,
  children,
}: {
  index: number;
  from: "left" | "right";
  reveal: boolean;
  instant: boolean;
  className: string;
  children: ReactNode;
}) {
  const hiddenX = from === "left" ? `-${EDGE}` : EDGE;

  return (
    <motion.div
      className={className}
      initial={false}
      animate={
        reveal
          ? { opacity: 1, x: 0 }
          : { opacity: 0, x: hiddenX }
      }
      transition={staggerTransition(index, instant)}
    >
      {children}
    </motion.div>
  );
}

/**
 * Kamancha first-page banners (Figma 704:4043 / 704:4123).
 */
export function HubBannerGrid({
  locale,
  labels,
  reveal = true,
  instant = false,
}: HubBannerGridProps) {
  const sameOrigin = { sameOrigin: true } as const;

  return (
    <div
      className="mx-auto grid w-full max-w-[1312px] grid-cols-1 gap-[18px] px-[15px] sm:px-6 xl:grid-cols-[repeat(24,minmax(0,1fr))] xl:gap-6 xl:px-16"
      data-node-id="704:4047"
    >
      <HubStaggerItem
        index={0}
        from="left"
        reveal={reveal}
        instant={instant}
        className="xl:col-span-12"
      >
        <HubBannerCard
          href={`/${locale}/restaurants`}
          label={labels.restaurants}
          photoSrc={staticAssetUrl(`${HUB}/street.webp`, sameOrigin)}
          logoSrc={staticAssetUrl(`${HUB}/kamancha-script.svg`, sameOrigin)}
          logoWidth={254}
          logoHeight={132}
          iconSrc={staticAssetUrl(`${HUB}/icon-location.svg`, sameOrigin)}
          photoNodeId="704:4049"
          photoClassName="object-cover object-[center_30%]"
          logoClassName="top-6 left-[23px] h-[135px] w-auto"
        />
      </HubStaggerItem>
      <HubStaggerItem
        index={1}
        from="right"
        reveal={reveal}
        instant={instant}
        className="xl:col-span-12"
      >
        <HubBannerCard
          href={`/${locale}/delivery`}
          label={labels.delivery}
          photoSrc={staticAssetUrl(`${HUB}/khorovats.webp`, sameOrigin)}
          logoSrc={staticAssetUrl(`${HUB}/factory-badge.webp`, sameOrigin)}
          logoWidth={254}
          logoHeight={100}
          iconSrc={staticAssetUrl(`${HUB}/icon-truck.svg`, sameOrigin)}
          photoNodeId="704:4056"
          photoClassName="object-cover"
          logoClassName="top-7 left-[40px] h-[100px] w-auto"
        />
      </HubStaggerItem>
      <HubStaggerItem
        index={2}
        from="left"
        reveal={reveal}
        instant={instant}
        className="xl:col-span-15"
      >
        <HubBannerCard
          href="https://restormania.am"
          label={labels.blog}
          photoSrc={staticAssetUrl(`${HUB}/restormania.webp`, sameOrigin)}
          logo={<RestormaniaHubMark />}
          iconSrc={staticAssetUrl(`${HUB}/icon-news.svg`, sameOrigin)}
          className="xl:h-[335px]"
          photoNodeId="704:4062"
          photoClassName="object-cover object-[center_28%]"
        />
      </HubStaggerItem>
      <HubStaggerItem
        index={3}
        from="right"
        reveal={reveal}
        instant={instant}
        className="xl:col-span-9"
      >
        <HubBannerCard
          href="https://pideh.am"
          label={labels.fastFood}
          photoSrc={staticAssetUrl(`${HUB}/pideh-full.webp`, sameOrigin)}
          logoSrc={staticAssetUrl(`${HUB}/pideh-logo.svg`, sameOrigin)}
          logoWidth={110}
          logoHeight={85}
          iconSrc={staticAssetUrl(`${HUB}/icon-fastfood.svg`, sameOrigin)}
          className="xl:h-[335px]"
          photoNodeId="704:4217"
          photoClassName="object-cover object-center"
          logoClassName="top-5 left-7 h-[85px] w-[110px]"
        />
      </HubStaggerItem>
    </div>
  );
}
