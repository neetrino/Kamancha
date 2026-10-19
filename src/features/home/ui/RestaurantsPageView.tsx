"use client";

import Image from "next/image";
import { useState } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { HubStaggerItem } from "@/features/home/ui/HubStaggerItem";
import { RestaurantVenueCard } from "@/features/home/ui/RestaurantVenueCard";
import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";
import {
  scheduleStateUpdate,
  useDeferredEffect,
} from "@/lib/react/schedule-after-paint";

const HUB = "/assets/brand/hub";
type RestaurantsPageViewProps = {
  locale: Locale;
  labels: {
    back: string;
    tumanyan: string;
    saryan: string;
    blog: string;
  };
};

/**
 * Restaurants list — same hub grid and edge stagger (704:4019 / 704:4230).
 */
export function RestaurantsPageView({ locale, labels }: RestaurantsPageViewProps) {
  const [reveal, setReveal] = useState(false);

  useDeferredEffect(() => {
    scheduleStateUpdate(setReveal, true);
  }, []);

  return (
    <section
      className="restaurants-page -mx-4 pt-0 sm:-mx-6 xl:-mx-8 xl:-mb-10"
      data-node-id="704:4019"
    >
      <div className="mx-auto w-full max-w-[1312px] px-[15px] sm:px-6 xl:px-16">
        <AppLink
          href={`/${locale}`}
          prefetchPolicy="intent"
          aria-label={labels.back}
          className="mb-[18px] inline-flex w-[64px] shrink-0 xl:mb-6"
        >
          <Image
            src={staticAssetUrl(`${HUB}/back-chevron.svg`)}
            alt=""
            width={64}
            height={43}
            unoptimized
            data-node-id="704:4040"
          />
        </AppLink>
      </div>

      <div
        className="mx-auto grid w-full max-w-[1312px] grid-cols-1 gap-[18px] px-[15px] sm:px-6 md:grid-cols-2 md:[&>:last-child:nth-child(odd)]:col-span-2 md:[&>:last-child:nth-child(odd)]:w-[calc(50%-9px)] md:[&>:last-child:nth-child(odd)]:justify-self-center xl:grid-cols-[repeat(24,minmax(0,1fr))] xl:gap-6 xl:px-16 xl:[&>:last-child:nth-child(odd)]:col-span-24 xl:[&>:last-child:nth-child(odd)]:w-auto xl:[&>:last-child:nth-child(odd)]:justify-self-stretch"
        data-node-id="709:4353"
      >
        <HubStaggerItem
          index={0}
          from="left"
          reveal={reveal}
          className="xl:col-span-12"
        >
          <RestaurantVenueCard
            title={labels.tumanyan}
            href={`${staticAssetUrl("/assets/menus/tumanyan-menu.pdf", { sameOrigin: true })}?v=3`}
            titleClassName="top-[calc(50%+63px)] right-[21px] xl:top-[calc(50%+106.5px)] xl:right-[43px] xl:text-[54px]"
            className="xl:h-[338px]"
            photoSrc={staticAssetUrl(`${HUB}/venue-tumanyan.webp`)}
            photoWidth={413}
            photoHeight={463}
            photoClassName="absolute top-[-69px] left-1/2 h-[463px] min-w-full w-[413px] -translate-x-1/2 object-cover xl:top-[-103px] xl:h-[713px] xl:w-[636px]"
            photoNodeId="704:4023"
            logoSrc={`${staticAssetUrl(`${HUB}/kamancha-script-venue.svg`)}?v=2`}
            logoWidth={210}
            logoHeight={113}
            logoClassName="top-[10px] left-5 h-[113px] w-[210px]"
            logoXlSrc={`${staticAssetUrl(`${HUB}/kamancha-script-venue-xl.svg`)}?v=2`}
            logoXlWidth={280}
            logoXlHeight={150}
            logoXlClassName="top-[18px] left-[37px] h-[150px] w-[280px]"
          />
        </HubStaggerItem>
        <HubStaggerItem
          index={1}
          from="right"
          reveal={reveal}
          className="xl:col-span-12"
        >
          <RestaurantVenueCard
            title={labels.saryan}
            titleClassName="top-[calc(50%+67px)] right-[41px] xl:top-[calc(50%+114.5px)] xl:right-[38px] xl:text-[54px]"
            className="xl:h-[338px]"
            photoSrc={staticAssetUrl(`${HUB}/venue-saryan.webp`)}
            photoWidth={397}
            photoHeight={531}
            photoClassName="absolute top-[-15px] left-0 h-[531px] w-full object-cover object-bottom xl:top-[-2px] xl:left-[-1px] xl:h-[849px] xl:w-[634px]"
            photoNodeId="704:4027"
            logoSrc={staticAssetUrl(`${HUB}/tapaka-logo.webp`)}
            logoWidth={236}
            logoHeight={133}
            logoClassName="top-[9px] left-[15px] h-[133px] w-[236px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.9)] xl:top-[5px] xl:left-[19px] xl:h-[172px] xl:w-[307px]"
          />
        </HubStaggerItem>
        <HubStaggerItem
          index={2}
          from="left"
          reveal={reveal}
          className="xl:col-span-24 xl:flex xl:justify-center"
        >
          <RestaurantVenueCard
            title={labels.blog}
            titleClassName="top-[181px] right-[37px] xl:top-[241px] xl:right-[39px]"
            className="xl:h-[301px] xl:w-[577px]"
            photoSrc={staticAssetUrl(`${HUB}/venue-blog-hq.webp`)}
            photoWidth={819}
            photoHeight={1024}
            photoClassName="absolute inset-0 h-full w-full object-cover object-[center_18%]"
            photoNodeId="704:4030"
          />
        </HubStaggerItem>
      </div>
    </section>
  );
}
