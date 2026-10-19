'use client';

import Image from 'next/image';

import {
  SITE_HEADER_INNER,
  STOREFRONT_TABLET_INSET_X,
} from '@/components/layout/site-header-classes';
import {
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
} from '@/features/home/ui/home-motion';
import { KAMANCHA_BRANCHES } from '@/lib/brand/store-locations';
import { staticAssetUrl } from '@/lib/media/static-asset-url';

const TUMANYAN_PHOTO = staticAssetUrl('/assets/brand/hub/venue-tumanyan.webp');
const SARYAN_PAINTING = `${staticAssetUrl('/assets/brand/home/our-story/saryan-landscape.webp', {
  sameOrigin: true,
})}?v=20261019`;
const DELIVERY_SRC = staticAssetUrl('/assets/brand/home/our-story/delivery-truck.webp');
const FACTORY_LOGO_SRC = staticAssetUrl('/assets/brand/hub/factory-badge.webp');
const FOUNDER_SRC = `${staticAssetUrl('/assets/brand/home/our-story/founder.webp')}?v=20260925`;
const PHONE_ICON_SRC = staticAssetUrl('/assets/brand/home/our-story/phone.svg');
const PIDEH_PHOTO = staticAssetUrl('/assets/brand/hub/pideh-hub.webp');
const PIDEH_LOGO = staticAssetUrl('/assets/brand/hub/pideh-logo.svg');
const PIDEH_HREF = 'https://pideh.am';

const cardTitleClass =
  'font-big-fat-boii text-[21px] leading-[24px] font-normal uppercase lg:text-[max(21px,1.67cqw)] lg:leading-[max(24px,1.91cqw)]';

type StoryCard = {
  title: string;
  body: string;
};

type DeliveryCard = StoryCard & {
  phone: string;
  titleSuffix?: string;
};

type HomeOurStoryProps = {
  tumanyan: StoryCard;
  saryan: StoryCard;
  delivery: DeliveryCard;
  founder: StoryCard;
  pidehAlt: string;
};

/**
 * About venue cards — Figma 744:1043.
 */
export function HomeOurStory({
  tumanyan,
  saryan,
  delivery,
  founder,
  pidehAlt,
}: HomeOurStoryProps) {
  return (
    <section
      data-node-id="744:1043"
      className="relative z-[1] overflow-visible pt-8 pb-0 sm:pt-12 md:pt-16 xl:pt-14 xl:pb-6"
    >
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible">
        <div
          className={`${SITE_HEADER_INNER} ${STOREFRONT_TABLET_INSET_X} relative z-[1] [container-type:inline-size]`}
        >
          <div className="mx-auto w-full max-w-[1253px]">
            <HomeStagger
              className="flex flex-col gap-5 xl:grid xl:grid-cols-[minmax(0,841px)_minmax(0,390px)] xl:items-stretch xl:gap-[22px]"
              stagger={0.08}
            >
              <HomeStaggerItem>
                <a
                  data-node-id="744:1046"
                  href={KAMANCHA_BRANCHES.tumanyan.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex flex-col overflow-hidden rounded-[30px] bg-white transition-opacity hover:opacity-95 xl:grid xl:h-[280px] xl:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]"
                >
                  <div className="relative z-[1] order-2 flex flex-col justify-center px-6 py-6 sm:px-8 xl:order-1 xl:px-7">
                    <h3 className="font-big-fat-boii text-[24px] leading-[28px] font-normal text-[#222] uppercase">
                      {tumanyan.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[20px] text-[rgba(38,81,39,0.69)]">
                      {tumanyan.body}
                    </p>
                  </div>
                  <div
                    data-node-id="744:1073"
                    className="relative order-1 h-[200px] overflow-hidden sm:h-[240px] xl:order-2 xl:h-full xl:min-h-0 xl:rounded-l-[24px]"
                  >
                    <Image
                      src={TUMANYAN_PHOTO}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 40vw, 70vw"
                      className="object-cover object-[center_40%]"
                    />
                  </div>
                </a>
              </HomeStaggerItem>

              <HomeStaggerItem>
                <a
                  data-node-id="744:1050"
                  href={KAMANCHA_BRANCHES.saryan.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex flex-col overflow-hidden rounded-[30px] bg-[#a2d39c] transition-opacity hover:opacity-95 xl:block xl:h-[292px]"
                >
                  <div className="relative z-[1] flex flex-col gap-3 px-6 pt-6 sm:px-8 xl:flex-row xl:items-start xl:gap-8 xl:px-8 xl:pt-[18px]">
                    <h3 className="font-big-fat-boii shrink-0 text-[24px] leading-[28px] font-normal text-[#222] uppercase xl:whitespace-nowrap">
                      {saryan.title}
                    </h3>
                    <p className="max-w-[36rem] text-[14px] leading-[20px] text-[rgba(0,0,0,0.62)]">
                      {saryan.body}
                    </p>
                  </div>
                  <div
                    data-node-id="744:1053"
                    className="relative mt-4 h-[160px] sm:h-[200px] xl:pointer-events-none xl:absolute xl:inset-x-0 xl:bottom-0 xl:mt-0 xl:h-[58%]"
                  >
                    <Image
                      src={SARYAN_PAINTING}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover object-top"
                    />
                  </div>
                </a>
              </HomeStaggerItem>

              <HomeStaggerItem className="max-xl:contents xl:grid xl:h-[314px] xl:grid-cols-[minmax(0,1fr)_306px] xl:gap-[22px]">
                <article
                  data-node-id="744:1054"
                  className="relative min-h-[314px] overflow-hidden rounded-[30px] bg-black xl:h-full xl:min-h-0"
                >
                  <div className="relative z-[1] px-6 pt-[22px] xl:pt-[18px] xl:pr-8 xl:pb-0 xl:pl-[35px]">
                    <h3 className="flex items-center gap-1 text-[#e5e2e1] xl:gap-[9px]">
                      <span className="sr-only">
                        {`${delivery.title}${delivery.titleSuffix ?? ''}`}
                      </span>
                      <Image
                        src={FACTORY_LOGO_SRC}
                        alt=""
                        width={360}
                        height={120}
                        className="h-[52px] w-auto max-w-[min(240px,85%)] object-contain object-left xl:h-[78px] xl:max-w-[247px]"
                      />
                      {delivery.titleSuffix ? (
                        <span className="font-big-fat-boii pb-1 text-[18px] leading-none font-normal text-[#e5e2e1] xl:pb-0 xl:text-[21px] xl:leading-[24px]" aria-hidden>
                          {delivery.titleSuffix}
                        </span>
                      ) : null}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[20px] text-white/72 xl:mt-4 xl:max-w-[447px] xl:leading-[24px]">
                      {delivery.body}
                    </p>
                    <a
                      data-node-id="455:204"
                      href={`tel:${delivery.phone.replace(/\s/g, '')}`}
                      className="mt-3 inline-flex items-center gap-2 text-[17px] leading-6 text-white xl:mt-4 xl:gap-[9px] xl:text-[18px] xl:leading-[24px]"
                    >
                      <Image
                        src={PHONE_ICON_SRC}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5 xl:size-[26px]"
                      />
                      {delivery.phone}
                    </a>
                  </div>
                  <div
                    data-node-id="744:1061"
                    className="pointer-events-none relative -mt-6 ml-auto h-[280px] w-full overflow-hidden xl:absolute xl:top-[69px] xl:right-auto xl:bottom-auto xl:left-[252px] xl:mt-0 xl:ml-0 xl:h-[236px] xl:w-[266px] xl:rounded-br-[30px] xl:opacity-30"
                  >
                    <Image
                      src={DELIVERY_SRC}
                      alt=""
                      width={520}
                      height={360}
                      className="ml-auto h-[280px] w-auto max-w-none object-contain object-right xl:absolute xl:top-[-20.94%] xl:left-0 xl:ml-0 xl:h-[143.59%] xl:w-[137.58%] xl:max-w-none xl:object-fill"
                    />
                  </div>
                </article>

                <a
                  data-node-id="744:1066"
                  href={PIDEH_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative order-2 block h-[280px] w-full overflow-hidden rounded-[30px] bg-[#c47828] transition-opacity hover:opacity-95 sm:h-[314px] xl:order-none xl:h-full xl:w-[306px] xl:justify-self-end"
                >
                  <Image
                    src={PIDEH_PHOTO}
                    alt={pidehAlt}
                    fill
                    sizes="306px"
                    className="object-cover object-[78%_center]"
                  />
                  <Image
                    src={PIDEH_LOGO}
                    alt=""
                    width={117}
                    height={90}
                    unoptimized
                    className="pointer-events-none absolute top-3.5 left-3 h-[96px] w-auto"
                  />
                </a>
              </HomeStaggerItem>

              <HomeReveal
                delay={0.2}
                y={40}
                x={20}
                amount={0.15}
                className="order-1 w-full xl:col-start-2 xl:row-span-3 xl:row-start-1 xl:order-none xl:h-auto"
              >
              <article
                data-node-id="744:1062"
                className="relative flex flex-col overflow-hidden rounded-[30px] bg-[#efe7da] xl:block xl:h-full xl:min-h-0"
              >
                <div className="relative z-[1] px-6 pt-8 pr-6 pb-2 xl:px-8 xl:pt-10 xl:pb-0 lg:px-[max(36px,2.86cqw)] lg:pt-[max(45px,3.58cqw)] lg:pr-[max(25px,1.99cqw)]">
                  <h3 className={`${cardTitleClass} text-[#222]`}>{founder.title}</h3>
                  <p className="mt-6 max-w-[329px] text-[16px] leading-[26px] text-[rgba(34,34,34,0.81)] lg:mt-[max(29px,2.31cqw)] lg:max-w-[max(329px,82%)] lg:text-[max(16px,1.27cqw)] lg:leading-[max(26px,2.07cqw)]">
                    {founder.body}
                  </p>
                </div>
                {/* Figma 744:1062 — cutout sits from ~32% down; platter clips to the card. */}
                <div className="relative -mt-2 h-[420px] w-full xl:pointer-events-none xl:absolute xl:top-[32%] xl:left-1/2 xl:mt-0 xl:h-[69%] xl:w-[118%] xl:-translate-x-1/2">
                  <Image
                    src={FOUNDER_SRC}
                    alt={founder.title}
                    fill
                    sizes="(min-width: 1024px) 32vw, 90vw"
                    className="object-cover object-[center_6%]"
                  />
                </div>
              </article>
            </HomeReveal>
            </HomeStagger>
          </div>
        </div>
      </div>
    </section>
  );
}
