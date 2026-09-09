'use client';

import Image from 'next/image';

import {
  HomeFloat,
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
} from '@/features/home/ui/home-motion';
import { HomeStoryCard, type HomeStoryCardImage } from '@/features/home/ui/HomeStoryCard';
import { staticAssetUrl } from '@/lib/media/static-asset-url';

const RUG_SRC = staticAssetUrl('/assets/brand/home/our-story/rug.webp');
const TUMANYAN_SRC = staticAssetUrl('/assets/brand/home/our-story/tumanyan-sign.webp');
const SARYAN_SRC = staticAssetUrl('/assets/brand/home/our-story/saryan-mountains.webp');
const DELIVERY_SRC = staticAssetUrl('/assets/brand/home/our-story/delivery-truck.webp');
const FOUNDER_SRC = staticAssetUrl('/assets/brand/home/our-story/founder.webp');
const PHONE_ICON_SRC = staticAssetUrl('/assets/brand/home/our-story/phone.svg');

/** Figma section 455:190 — 1257px content width; type and cards scale with it. */
const cardTitleClass =
  'font-big-fat-boii text-[21px] leading-[24px] font-normal uppercase lg:text-[max(21px,1.67cqw)] lg:leading-[max(24px,1.91cqw)]';
const cardBodyClass =
  'text-[14px] leading-[20px] lg:text-[max(14px,1.11cqw)] lg:leading-[max(20px,1.59cqw)]';
const cardBodyRelaxedClass =
  'text-[14px] leading-[24px] lg:text-[max(14px,1.11cqw)] lg:leading-[max(24px,1.91cqw)]';
const venueCardBodyClass = `${cardBodyClass} mt-[11px] lg:mt-[max(11px,0.88cqw)]`;
const venueCardClass = 'h-[292px] lg:h-[max(292px,23.23cqw)]';

const TUMANYAN_IMAGE: HomeStoryCardImage = {
  src: TUMANYAN_SRC,
  width: 824,
  height: 549,
  sizes: '(min-width: 1440px) 412px, 32vw',
  frame: { left: 0, top: 55.82, width: 105.64, height: 76.71 },
  inner: { left: 0, top: -22.47, width: 100, height: 122.62 },
};

const SARYAN_IMAGE: HomeStoryCardImage = {
  src: SARYAN_SRC,
  width: 478,
  height: 640,
  sizes: '(min-width: 1440px) 408px, 32vw',
  frame: { left: 0, top: 52.74, width: 100, height: 47.26 },
  inner: { left: 0, top: -0.46, width: 100, height: 395.85 },
};

const DELIVERY_IMAGE: HomeStoryCardImage = {
  src: DELIVERY_SRC,
  width: 826,
  height: 765,
  sizes: '(min-width: 1440px) 413px, 32vw',
  frame: { left: 56.1, top: 0, width: 43.9, height: 100 },
  inner: { left: 0, top: -20.94, width: 114.72, height: 143.59 },
};

const FOUNDER_IMAGE = {
  src: FOUNDER_SRC,
  width: 2240,
  height: 1494,
  sizes: '(min-width: 1440px) 1120px, 80vw',
  frame: { left: -10.77, top: 36.95, width: 146.67, height: 73.5 },
  inner: { left: -47.95, top: -32.82, width: 195.89, height: 132.88 },
} satisfies Omit<HomeStoryCardImage, 'alt'>;

type StoryCard = {
  title: string;
  body: string;
};

type DeliveryCard = StoryCard & {
  phone: string;
};

type HomeOurStoryProps = {
  title: string;
  intro: string;
  introSecond: string;
  tumanyan: StoryCard;
  saryan: StoryCard;
  delivery: DeliveryCard;
  founder: StoryCard;
};

/**
 * Our story — venue, delivery, and founder cards over the rug backdrop.
 * Figma 455:190; the rug behind the section is 22:186.
 */
export function HomeOurStory({
  title,
  intro,
  introSecond,
  tumanyan,
  saryan,
  delivery,
  founder,
}: HomeOurStoryProps) {
  return (
    <section
      data-node-id="455:190"
      className="relative z-[1] overflow-visible pt-14 pb-36 sm:pt-16 sm:pb-44 md:pt-20 md:pb-56"
    >
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible">
        {/* Rug — hero-side pattern: pinned to viewport right, capped like 13" */}
        <HomeReveal
          delay={0.12}
          y={48}
          x={32}
          className="pointer-events-none absolute top-[-8%] right-0 z-0 hidden md:block"
          aria-hidden
          data-node-id="22:186"
        >
          <HomeFloat amplitude={7} duration={7.5}>
            <div className="relative aspect-[768/1024] w-[min(70vw,1008px)] origin-center rotate-[70deg]">
              <Image
                src={RUG_SRC}
                alt=""
                fill
                sizes="(min-width: 1440px) 1008px, 70vw"
                className="object-contain drop-shadow-[0_28px_56px_rgba(0,0,0,0.4)]"
              />
            </div>
          </HomeFloat>
        </HomeReveal>

        <div className="relative z-[1] grid w-full gap-10 px-[max(5rem,8vw)] [container-type:inline-size] lg:grid-cols-[820fr_390fr] lg:items-start lg:gap-[max(47px,3.74cqw)]">
          <div className="min-w-0">
            <HomeReveal>
              <h2
                data-node-id="455:191"
                className="font-big-fat-boii text-[clamp(36px,5vw,58px)] leading-[1.05] font-normal text-[#e5e2e1] uppercase lg:text-[max(58px,4.61cqw)]"
              >
                {title}
              </h2>
            </HomeReveal>

            <HomeReveal delay={0.08}>
              <div
                data-node-id="455:192"
                className="mt-4 max-w-[650px] text-[16px] leading-[26px] text-[#c2c9bd] lg:mt-[max(16px,1.27cqw)] lg:max-w-[51.71cqw] lg:text-[max(16px,1.27cqw)] lg:leading-[max(26px,2.07cqw)]"
              >
                <p>{intro}</p>
                <p>{introSecond}</p>
              </div>
            </HomeReveal>

            <HomeStagger
              className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-[390fr_408fr] sm:gap-[22px] lg:mt-[max(74px,5.89cqw)] lg:gap-[max(22px,1.75cqw)]"
              stagger={0.1}
            >
              <HomeStaggerItem>
                <HomeStoryCard
                  nodeId="455:193"
                  title={tumanyan.title}
                  body={tumanyan.body}
                  image={TUMANYAN_IMAGE}
                  className={`bg-white ${venueCardClass}`}
                  contentClassName="px-[23px] pt-[33px] lg:px-[max(23px,1.83cqw)] lg:pt-[max(33px,2.63cqw)]"
                  titleClassName={`${cardTitleClass} text-[#222]`}
                  bodyClassName={`${venueCardBodyClass} text-[rgba(38,81,39,0.69)]`}
                />
              </HomeStaggerItem>

              <HomeStaggerItem>
                <HomeStoryCard
                  nodeId="455:197"
                  title={saryan.title}
                  body={saryan.body}
                  image={SARYAN_IMAGE}
                  className={`bg-[#a2d39c] ${venueCardClass}`}
                  contentClassName="px-[26px] pt-[28px] lg:px-[max(26px,2.07cqw)] lg:pt-[max(28px,2.23cqw)]"
                  titleClassName={`${cardTitleClass} text-[#222]`}
                  bodyClassName={`${venueCardBodyClass} text-black/59`}
                />
              </HomeStaggerItem>
            </HomeStagger>

            <HomeReveal delay={0.16} className="mt-5 sm:mt-[32px] lg:mt-[max(32px,2.55cqw)]">
              <HomeStoryCard
                nodeId="455:201"
                title={delivery.title}
                body={delivery.body}
                image={DELIVERY_IMAGE}
                className="h-[266px] bg-black lg:h-[max(266px,21.16cqw)]"
                contentClassName="max-w-[62%] pt-[25px] pr-4 pl-[41px] lg:max-w-[51.1%] lg:pt-[max(25px,1.99cqw)] lg:pl-[max(41px,3.26cqw)]"
                titleClassName={`${cardTitleClass} text-[#e5e2e1]`}
                bodyClassName={`${cardBodyRelaxedClass} mt-[18px] text-white/72 lg:mt-[max(18px,1.43cqw)]`}
              >
                <a
                  data-node-id="455:204"
                  href={`tel:${delivery.phone.replace(/\s/g, '')}`}
                  className="mt-[10px] inline-flex items-center gap-[8px] text-[14px] leading-[24px] text-white lg:mt-[max(10px,0.8cqw)] lg:text-[max(14px,1.11cqw)]"
                >
                  <Image
                    src={PHONE_ICON_SRC}
                    alt=""
                    width={20}
                    height={20}
                    className="size-[20px] lg:size-[max(20px,1.59cqw)]"
                  />
                  {delivery.phone}
                </a>
              </HomeStoryCard>
            </HomeReveal>
          </div>

          <HomeReveal
            delay={0.2}
            y={40}
            x={20}
            amount={0.15}
            className="lg:mt-[max(170px,13.52cqw)] lg:w-full"
          >
            <HomeStoryCard
              nodeId="455:209"
              title={founder.title}
              body={founder.body}
              image={{ ...FOUNDER_IMAGE, alt: founder.title }}
              className="h-[766px] bg-[#efe7da] lg:h-[max(766px,60.94cqw)]"
              contentClassName="pt-[44px] pr-[25px] pl-[36px] lg:pt-[max(44px,3.5cqw)] lg:pr-[max(25px,1.99cqw)] lg:pl-[max(36px,2.86cqw)]"
              titleClassName={`${cardTitleClass} text-[#222]`}
              bodyClassName={`${cardBodyRelaxedClass} mt-[30px] text-[rgba(34,34,34,0.81)] lg:mt-[max(30px,2.39cqw)]`}
            />
          </HomeReveal>
        </div>
      </div>
    </section>
  );
}
