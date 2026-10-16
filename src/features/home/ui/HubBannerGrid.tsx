"use client";

import { HubBannerCard } from "@/features/home/ui/HubBannerCard";
import { HubStaggerItem } from "@/features/home/ui/HubStaggerItem";
import { RestormaniaHubMark } from "@/features/home/ui/RestormaniaHubMark";
import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const HUB = "/assets/brand/hub";

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
  playFromHidden?: boolean;
};

/**
 * Kamancha first-page banners (Figma 704:4043 / 704:4123).
 */
export function HubBannerGrid({
  locale,
  labels,
  reveal = true,
  instant = false,
  playFromHidden = false,
}: HubBannerGridProps) {
  const sameOrigin = { sameOrigin: true } as const;

  return (
    <div
      className="mx-auto grid w-full max-w-[1312px] grid-cols-1 gap-[18px] px-[15px] sm:px-6 md:grid-cols-2 md:[&>:last-child:nth-child(odd)]:col-span-2 md:[&>:last-child:nth-child(odd)]:w-[calc(50%-9px)] md:[&>:last-child:nth-child(odd)]:justify-self-center xl:grid-cols-[repeat(24,minmax(0,1fr))] xl:gap-6 xl:px-16 xl:[&>:last-child:nth-child(odd)]:col-span-24 xl:[&>:last-child:nth-child(odd)]:w-auto xl:[&>:last-child:nth-child(odd)]:justify-self-stretch"
      data-node-id="704:4047"
    >
      <HubStaggerItem
        index={0}
        from="left"
        reveal={reveal}
        instant={instant}
        playFromHidden={playFromHidden}
        className="xl:col-span-12"
      >
        <HubBannerCard
          href={`/${locale}/restaurants`}
          label={labels.restaurants}
          photoSrc={staticAssetUrl(`${HUB}/street.webp`, sameOrigin)}
          logoSrc={staticAssetUrl(`${HUB}/kamancha-script.svg`, sameOrigin)}
          logoWidth={248}
          logoHeight={132}
          iconSrc={staticAssetUrl(`${HUB}/icon-location.svg`, sameOrigin)}
          photoNodeId="704:4049"
          photoClassName="absolute top-[-48.5%] left-1/2 h-[244.4%] w-[calc(100%+4px)] max-w-none -translate-x-1/2 object-cover xl:inset-0 xl:top-0 xl:left-0 xl:h-full xl:w-full xl:translate-x-0 xl:object-[center_30%]"
          logoClassName="top-[6px] left-[4px] h-[87px] w-[167px] xl:top-6 xl:left-[23px] xl:h-[142px] xl:w-auto"
        />
      </HubStaggerItem>
      <HubStaggerItem
        index={1}
        from="right"
        reveal={reveal}
        instant={instant}
        playFromHidden={playFromHidden}
        className="xl:col-span-12"
      >
        <HubBannerCard
          href={`/${locale}/delivery`}
          label={labels.delivery}
          photoSrc={staticAssetUrl(`${HUB}/khorovats.webp`, sameOrigin)}
          logoSrc={staticAssetUrl(`${HUB}/factory-badge.webp`, sameOrigin)}
          logoWidth={244}
          logoHeight={96}
          iconSrc={staticAssetUrl(`${HUB}/icon-truck.svg`, sameOrigin)}
          photoNodeId="704:4056"
          photoClassName="absolute top-[-39%] left-[-2px] h-[175.7%] w-[calc(100%+4px)] max-w-none object-cover xl:inset-0 xl:top-0 xl:left-0 xl:h-full xl:w-full"
          logoClassName="top-[12px] left-[8px] h-[74px] w-[183px] xl:top-7 xl:left-[24px] xl:h-[104px] xl:w-auto"
        />
      </HubStaggerItem>
      <HubStaggerItem
        index={2}
        from="left"
        reveal={reveal}
        instant={instant}
        playFromHidden={playFromHidden}
        className="xl:col-span-15"
      >
        <HubBannerCard
          href="https://restormania.am"
          label={labels.blog}
          photoSrc={staticAssetUrl(`${HUB}/restormania.webp`, sameOrigin)}
          logo={<RestormaniaHubMark className="top-[15px] left-[19px] origin-top-left xl:scale-110" />}
          iconSrc={staticAssetUrl(`${HUB}/icon-news.svg`, sameOrigin)}
          className="xl:h-[335px]"
          photoNodeId="704:4062"
          photoClassName="absolute top-[-33.1%] left-[-2px] h-[163.9%] w-[112%] max-w-none object-cover xl:inset-0 xl:top-0 xl:left-0 xl:h-full xl:w-full xl:object-[center_28%]"
        />
      </HubStaggerItem>
      <HubStaggerItem
        index={3}
        from="right"
        reveal={reveal}
        instant={instant}
        playFromHidden={playFromHidden}
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
          className="bg-[#753e00] xl:h-[335px] xl:bg-brand-forest"
          photoNodeId="704:4120"
          photoClassName="absolute top-1/2 right-[16px] h-[150%] w-[82%] max-w-none -translate-y-1/2 object-contain object-right xl:inset-0 xl:top-0 xl:right-0 xl:h-full xl:w-full xl:translate-y-0 xl:object-cover xl:object-center"
          logoClassName="top-[18px] left-4 h-[90px] w-[117px] xl:top-5 xl:left-7 xl:h-[85px] xl:w-[110px]"
        />
      </HubStaggerItem>
    </div>
  );
}
