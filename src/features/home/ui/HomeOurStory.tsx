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
const SARYAN_PAINTING = `${staticAssetUrl('/assets/brand/home/our-story/saryan-card.webp', {
  sameOrigin: true,
})}?v=20261020b`;
const TAPAKA_ROOMS_LOGO = staticAssetUrl('/assets/brand/home/our-story/tapaka-rooms-logo.webp', {
  sameOrigin: true,
});
const FACTORY_PLATTER = staticAssetUrl('/assets/brand/home/our-story/factory-platter.webp', {
  sameOrigin: true,
});
const FACTORY_LOGO_SRC = staticAssetUrl('/assets/brand/home/our-story/factory-badge-cutout.webp', {
  sameOrigin: true,
});
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
              className="flex flex-col gap-5 min-[744px]:grid min-[744px]:grid-cols-2 min-[744px]:items-stretch xl:grid-cols-[minmax(0,841px)_minmax(0,390px)] xl:items-stretch xl:gap-[22px]"
              stagger={0.08}
            >
              <HomeStaggerItem className="min-[744px]:max-xl:h-full">
                <a
                  data-node-id="744:1046"
                  href={KAMANCHA_BRANCHES.tumanyan.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-full flex-col overflow-hidden rounded-[30px] bg-white transition-opacity hover:opacity-95 xl:grid xl:h-[280px] xl:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]"
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

              <HomeStaggerItem className="min-[744px]:max-xl:h-full">
                <a
                  data-node-id="744:1050"
                  href={KAMANCHA_BRANCHES.saryan.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex h-full flex-col overflow-hidden rounded-[30px] bg-[#a2d39c] transition-opacity hover:opacity-95 xl:block xl:h-[320px]"
                >
                  <div
                    data-node-id="744:1053"
                    className="pointer-events-none relative order-2 mt-2 h-[180px] overflow-hidden sm:h-[220px] xl:absolute xl:top-[150px] xl:left-0 xl:mt-0 xl:h-[170px] xl:w-full"
                  >
                    <img
                      src={SARYAN_PAINTING}
                      alt=""
                      className="absolute inset-0 h-full w-full max-w-none object-cover object-center xl:object-fill"
                    />
                  </div>
                  <div className="relative z-[1] flex flex-col gap-3 px-6 pt-5 pb-2 sm:px-8 xl:absolute xl:inset-x-0 xl:top-0 xl:block xl:px-0 xl:pt-0 xl:pb-0">
                    <div className="flex items-center gap-4 xl:block">
                      <img
                        data-node-id="796:317"
                        src={TAPAKA_ROOMS_LOGO}
                        alt=""
                        width={400}
                        height={223}
                        className="h-[88px] w-[157px] shrink-0 object-contain object-left xl:absolute xl:top-[11px] xl:left-[37px] xl:h-[112px] xl:w-[200px]"
                      />
                      <h3 className="font-big-fat-boii text-[21px] leading-[24px] font-normal text-[#222] uppercase xl:absolute xl:top-[28px] xl:left-[248px]">
                        {saryan.title}
                      </h3>
                    </div>
                    <p className="text-[14px] leading-[19px] text-[rgba(0,0,0,0.59)] xl:absolute xl:top-[61px] xl:left-[248px] xl:w-[561px]">
                      {saryan.body}
                    </p>
                  </div>
                </a>
              </HomeStaggerItem>

              <HomeStaggerItem className="max-[743px]:contents flex h-full min-h-0 flex-col gap-5 xl:grid xl:h-[314px] xl:grid-cols-[minmax(0,1fr)_306px] xl:gap-[22px]">
                <article
                  data-node-id="744:1054"
                  className="relative min-h-[314px] shrink-0 overflow-hidden rounded-[30px] bg-black xl:h-[314px] xl:min-h-0"
                >
                  <div
                    data-node-id="796:320"
                    className="pointer-events-none relative mx-auto h-[220px] w-full overflow-hidden sm:h-[260px] xl:absolute xl:top-[-26px] xl:left-[196px] xl:mx-0 xl:h-[343px] xl:w-[479px]"
                  >
                    <Image
                      src={FACTORY_PLATTER}
                      alt=""
                      fill
                      unoptimized
                      sizes="479px"
                      className="scale-y-[-1] object-cover object-center max-xl:-translate-x-3 xl:object-bottom"
                    />
                  </div>
                  <div className="relative z-[1] px-6 pt-5 pb-6 xl:absolute xl:inset-0 xl:px-0 xl:pt-0 xl:pb-0">
                    <h3 className="flex items-end gap-2 xl:absolute xl:top-[18px] xl:left-[6px]">
                      <span className="sr-only">
                        {`${delivery.title}${delivery.titleSuffix ?? ''}`}
                      </span>
                      <Image
                        data-node-id="744:1078"
                        src={FACTORY_LOGO_SRC}
                        alt=""
                        width={506}
                        height={202}
                        unoptimized
                        className="h-[72px] w-auto max-w-[min(220px,70%)] object-contain object-left xl:h-[101px] xl:w-[253px] xl:max-w-none"
                      />
                      {delivery.titleSuffix ? (
                        <span
                          data-node-id="744:1056"
                          className="font-big-fat-boii pb-2 text-[18px] leading-none font-normal text-[#e5e2e1] uppercase xl:absolute xl:top-[63px] xl:left-[246px] xl:pb-0 xl:text-[21px] xl:leading-[24px]"
                          aria-hidden
                        >
                          {delivery.titleSuffix}
                        </span>
                      ) : null}
                    </h3>
                    <p
                      data-node-id="744:1055"
                      className="mt-3 max-w-[447px] text-[14px] leading-[22px] text-white/72 xl:absolute xl:top-[136px] xl:left-[35px] xl:mt-0 xl:w-[447px] xl:leading-[24px]"
                    >
                      {delivery.body}
                    </p>
                    <a
                      data-node-id="744:1057"
                      href={`tel:${delivery.phone.replace(/\s/g, '')}`}
                      className="mt-3 inline-flex items-center gap-[9px] text-[14px] leading-[24px] text-white xl:absolute xl:top-[258px] xl:left-[43px] xl:mt-0"
                    >
                      <Image
                        src={PHONE_ICON_SRC}
                        alt=""
                        width={26}
                        height={26}
                        className="size-[26px]"
                      />
                      {delivery.phone}
                    </a>
                  </div>
                </article>

                <a
                  data-node-id="744:1066"
                  href={PIDEH_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative order-2 block h-[280px] w-full shrink-0 overflow-hidden rounded-[30px] bg-[#c47828] transition-opacity hover:opacity-95 sm:h-[314px] min-[744px]:max-xl:!h-auto min-[744px]:max-xl:min-h-0 min-[744px]:max-xl:flex-1 xl:order-none xl:h-full xl:w-[306px] xl:shrink xl:flex-none xl:justify-self-end"
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
                className="order-1 w-full min-[744px]:h-auto min-[744px]:self-start xl:col-start-2 xl:row-span-3 xl:row-start-1 xl:order-none xl:h-auto xl:self-auto"
              >
              <article
                data-node-id="744:1062"
                className="relative flex flex-col overflow-hidden rounded-[30px] bg-[#efe7da] min-[744px]:h-auto xl:block xl:h-full xl:min-h-0"
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
