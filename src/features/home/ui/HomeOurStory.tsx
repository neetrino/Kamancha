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
const cardBodyClass =
  'text-[14px] leading-[20px] lg:text-[max(14px,1.11cqw)] lg:leading-[max(20px,1.59cqw)]';

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
      className="relative z-[1] overflow-visible pt-14 pb-6 sm:pt-16 sm:pb-8 md:pt-20 md:pb-8"
    >
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible">
        <div
          className={`${SITE_HEADER_INNER} ${STOREFRONT_TABLET_INSET_X} relative z-[1] [container-type:inline-size]`}
        >
          <div className="mx-auto grid w-full max-w-[1253px] grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,841px)_minmax(0,390px)] lg:items-stretch lg:gap-[22px]">
            <HomeStagger className="flex min-w-0 flex-col gap-5 lg:gap-[22px]" stagger={0.08}>
              <HomeStaggerItem>
                <a
                  data-node-id="744:1046"
                  href={KAMANCHA_BRANCHES.tumanyan.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative grid h-[280px] grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] overflow-hidden rounded-[30px] bg-white transition-opacity hover:opacity-95"
                >
                  <div className="relative z-[1] flex flex-col justify-center px-7 py-6 sm:px-8">
                    <h3 className="font-big-fat-boii text-[24px] leading-[28px] font-normal text-[#222] uppercase">
                      {tumanyan.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[20px] text-[rgba(38,81,39,0.69)]">
                      {tumanyan.body}
                    </p>
                  </div>
                  <div
                    data-node-id="744:1073"
                    className="relative h-full min-h-0 overflow-hidden rounded-l-[24px]"
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
                  className="relative block h-[292px] overflow-hidden rounded-[30px] bg-[#a2d39c] transition-opacity hover:opacity-95"
                >
                  <div className="relative z-[1] flex items-start gap-7 px-8 pt-[18px] sm:gap-8">
                    <h3 className="font-big-fat-boii shrink-0 text-[24px] leading-[28px] font-normal whitespace-nowrap text-[#222] uppercase">
                      {saryan.title}
                    </h3>
                    <p className="max-w-[36rem] text-[14px] leading-[20px] text-[rgba(0,0,0,0.62)]">
                      {saryan.body}
                    </p>
                  </div>
                  <div
                    data-node-id="744:1053"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%]"
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

              <HomeStaggerItem className="grid grid-cols-1 gap-5 sm:h-[314px] sm:grid-cols-[minmax(0,1fr)_306px] sm:gap-[22px]">
                <article
                  data-node-id="744:1054"
                  className="relative min-h-[314px] overflow-hidden rounded-[30px] bg-black sm:min-h-0 sm:h-full"
                >
                  <div className="relative z-[1] max-w-[58%] pt-[22px] pr-2 pl-[32px]">
                    <h3 className="flex items-center gap-1 text-[#e5e2e1]">
                      <span className="sr-only">
                        {`${delivery.title}${delivery.titleSuffix ?? ''}`}
                      </span>
                      <Image
                        src={FACTORY_LOGO_SRC}
                        alt=""
                        width={360}
                        height={120}
                        className="h-[52px] w-auto max-w-[min(240px,85%)] object-contain object-left"
                      />
                      {delivery.titleSuffix ? (
                        <span className="font-big-fat-boii pb-1 text-[18px] leading-none font-normal text-[#e5e2e1]" aria-hidden>
                          {delivery.titleSuffix}
                        </span>
                      ) : null}
                    </h3>
                    <p className="mt-3 text-[14px] leading-[20px] text-white/72">
                      {delivery.body}
                    </p>
                    <a
                      data-node-id="455:204"
                      href={`tel:${delivery.phone.replace(/\s/g, '')}`}
                      className="mt-3 inline-flex items-center gap-2 text-[14px] leading-6 text-white"
                    >
                      <Image
                        src={PHONE_ICON_SRC}
                        alt=""
                        width={20}
                        height={20}
                        className="size-5"
                      />
                      {delivery.phone}
                    </a>
                  </div>
                  <div className="pointer-events-none absolute right-0 bottom-[4%] h-[82%] w-[46%]">
                    <Image
                      src={DELIVERY_SRC}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 22vw, 50vw"
                      className="object-contain object-[right_bottom]"
                    />
                  </div>
                </article>

                <a
                  data-node-id="744:1066"
                  href={PIDEH_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block h-[314px] w-full overflow-hidden rounded-[30px] bg-[#c47828] transition-opacity hover:opacity-95 sm:h-full sm:w-[306px] sm:justify-self-end"
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
            </HomeStagger>

            <HomeReveal delay={0.2} y={40} x={20} amount={0.15} className="w-full lg:h-auto">
              <article
                data-node-id="744:1062"
                className="relative h-[520px] overflow-hidden rounded-[30px] bg-[#efe7da] lg:h-full lg:min-h-0"
              >
                <div className="relative z-[1] px-8 pt-10 pr-6 lg:px-[max(36px,2.86cqw)] lg:pt-[max(45px,3.58cqw)] lg:pr-[max(25px,1.99cqw)]">
                  <h3 className={`${cardTitleClass} text-[#222]`}>{founder.title}</h3>
                  <p className="mt-6 max-w-[329px] text-[16px] leading-[26px] text-[rgba(34,34,34,0.81)] lg:mt-[max(29px,2.31cqw)] lg:max-w-[max(329px,82%)] lg:text-[max(16px,1.27cqw)] lg:leading-[max(26px,2.07cqw)]">
                    {founder.body}
                  </p>
                </div>
                {/* Figma 744:1062 — cutout sits from ~32% down; platter clips to the card. */}
                <div className="pointer-events-none absolute top-[32%] left-1/2 h-[69%] w-[118%] -translate-x-1/2">
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
          </div>
        </div>
      </div>
    </section>
  );
}
