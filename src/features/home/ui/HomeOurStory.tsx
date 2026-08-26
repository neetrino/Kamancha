"use client";

import Image from "next/image";

import {
  HomeFloat,
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
} from "@/features/home/ui/home-motion";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const PLATE_SRC = staticAssetUrl("/assets/brand/home/family-dinner-plate.webp");
const GRAPES_SRC = staticAssetUrl("/assets/brand/home/our-story/grapes-jug.webp");
const DOLMA_SRC = staticAssetUrl("/assets/brand/home/our-story/dolma.webp");
const KAMANCHA_SRC = staticAssetUrl("/assets/brand/home/our-story/kamancha.webp");
const RUG_SRC = staticAssetUrl("/assets/brand/home/our-story/rug.webp");

/** Figma mosaic 1338px — grow type and cards on wider screens. */
const mosaicTitleClass =
  "font-big-fat-boii text-[21px] leading-6 font-normal uppercase lg:text-[max(21px,1.57cqw)] lg:leading-[max(24px,1.79cqw)]";
const mosaicBodyClass =
  "text-[14px] leading-6 lg:text-[max(14px,1.05cqw)] lg:leading-[max(24px,1.79cqw)]";
const mosaicCardHeightClass = "h-[182px] lg:h-[max(182px,13.6cqw)]";

type StoryCard = {
  title: string;
  body: string;
};

type HomeOurStoryProps = {
  title: string;
  intro: string;
  introSecond: string;
  cardWhite: StoryCard;
  cardGreen: StoryCard;
  cardBlack: StoryCard;
  cardTall: StoryCard;
};

/**
 * Our story mosaic — Figma 98:20, background rug 22:186.
 * Scales title, copy, and cards with the section width on large screens.
 */
export function HomeOurStory({
  title,
  intro,
  introSecond,
  cardWhite,
  cardGreen,
  cardBlack,
  cardTall,
}: HomeOurStoryProps) {
  return (
    <section
      data-node-id="98:20"
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

        <div className="relative z-[1] grid w-full gap-10 px-[max(5rem,8vw)] [container-type:inline-size] lg:grid-cols-[821fr_390fr] lg:items-start lg:gap-[max(41px,3.06cqw)]">
          <div className="min-w-0 overflow-visible">
            <HomeReveal>
              <h2
                data-node-id="22:330"
                className="font-big-fat-boii text-[clamp(36px,5vw,58px)] leading-[1.05] font-normal text-[#e5e2e1] uppercase lg:text-[max(58px,4.34cqw)]"
              >
                {title}
              </h2>
            </HomeReveal>

            <HomeReveal delay={0.08}>
              <p
                data-node-id="22:331"
                className="mt-8 max-w-[650px] text-[16px] leading-[26px] text-[#c2c9bd] sm:mt-10 lg:mt-[max(40px,2.99cqw)] lg:max-w-[48.58cqw] lg:text-[max(16px,1.2cqw)] lg:leading-[max(26px,1.94cqw)]"
              >
                {intro}
              </p>
            </HomeReveal>

            <HomeReveal delay={0.14}>
              <p
                data-node-id="22:332"
                className="mt-6 max-w-[614px] text-[16px] leading-[26px] text-[#c2c9bd] lg:mt-[max(24px,1.79cqw)] lg:max-w-[45.89cqw] lg:text-[max(16px,1.2cqw)] lg:leading-[max(26px,1.94cqw)]"
              >
                {introSecond}
              </p>
            </HomeReveal>

            <HomeStagger
              className="relative z-[1] mt-10 grid grid-cols-1 gap-5 overflow-visible sm:mt-12 sm:grid-cols-2 sm:gap-[41px] lg:mt-[max(48px,3.59cqw)] lg:gap-[max(41px,3.06cqw)]"
              stagger={0.1}
            >
              {/* White card — 22:333 */}
              <HomeStaggerItem>
                <article
                  data-node-id="22:333"
                  className={`relative z-[1] overflow-visible rounded-[30px] bg-white ${mosaicCardHeightClass}`}
                >
                  <div className="relative z-10 max-w-[232px] pt-[19px] pr-4 pl-8 lg:max-w-[17.34cqw] lg:pt-[max(19px,1.42cqw)] lg:pl-[max(32px,2.39cqw)]">
                    <h3
                      data-node-id="41:239"
                      className={`${mosaicTitleClass} text-brand-forest`}
                    >
                      {cardWhite.title}
                    </h3>
                    <p
                      data-node-id="41:241"
                      className={`${mosaicBodyClass} mt-4 text-[rgba(38,81,39,0.69)] lg:mt-[max(16px,1.2cqw)]`}
                    >
                      {cardWhite.body}
                    </p>
                  </div>
                  <div
                    className="pointer-events-none absolute top-[-28px] right-0 h-[210px] w-[226px] overflow-hidden rounded-br-[30px] rounded-bl-[43px] lg:top-[min(-28px,-2.09cqw)] lg:h-[max(210px,15.7cqw)] lg:w-[max(226px,16.89cqw)]"
                    aria-hidden
                  >
                    <Image
                      src={PLATE_SRC}
                      alt=""
                      width={1402}
                      height={1747}
                      sizes="(min-width: 1440px) 17vw, 226px"
                      className="absolute top-[-0.04%] left-0 h-[179.96%] w-[134.07%] max-w-none"
                    />
                  </div>
                </article>
              </HomeStaggerItem>

              {/* Green card — 22:334 */}
              <HomeStaggerItem>
                <article
                  data-node-id="22:334"
                  className={`relative z-[2] overflow-visible ${mosaicCardHeightClass}`}
                >
                  <div
                    className="absolute inset-0 rounded-[30px] bg-[#a2d39c]"
                    aria-hidden
                  />
                  <div className="relative z-10 max-w-[55%] pt-6 pr-2 pl-[29px] lg:pt-[max(24px,1.79cqw)] lg:pl-[max(29px,2.17cqw)]">
                    <h3
                      data-node-id="41:243"
                      className={`${mosaicTitleClass} text-[#222]`}
                    >
                      {cardGreen.title}
                    </h3>
                    <p
                      data-node-id="41:244"
                      className={`${mosaicBodyClass} mt-4 line-clamp-4 text-black/59 lg:mt-[max(16px,1.2cqw)]`}
                    >
                      {cardGreen.body}
                    </p>
                  </div>
                  {/* Jug + grapes — Figma 41:236 @ 169,-87 / 239×269 on 390×182 card */}
                  <div
                    data-node-id="41:236"
                    className="pointer-events-none absolute top-[-47.8%] left-[43.3%] z-[1] h-[147.8%] w-[61.3%] overflow-hidden"
                    aria-hidden
                  >
                    <Image
                      src={GRAPES_SRC}
                      alt=""
                      width={1200}
                      height={1800}
                      quality={100}
                      unoptimized
                      sizes="(max-width: 768px) 40vw, (min-width: 1440px) 18vw, 239px"
                      className="pointer-events-none absolute top-0 left-0 h-[132.46%] w-full max-w-none"
                    />
                  </div>
                </article>
              </HomeStaggerItem>

              {/* Black wide card — 22:335 */}
              <HomeStaggerItem className="sm:col-span-2">
                <article
                  data-node-id="22:335"
                  className={`relative z-[1] overflow-visible ${mosaicCardHeightClass}`}
                >
                  <div
                    className="absolute inset-0 rounded-[30px] bg-black"
                    aria-hidden
                  />
                  <div className="relative z-10 max-w-[463px] pt-[26px] pr-4 pl-[31px] lg:max-w-[34.6cqw] lg:pt-[max(26px,1.94cqw)] lg:pl-[max(31px,2.32cqw)]">
                    <h3
                      data-node-id="41:238"
                      className={`${mosaicTitleClass} text-[#e5e2e1]`}
                    >
                      {cardBlack.title}
                    </h3>
                    <p
                      data-node-id="41:228"
                      className={`${mosaicBodyClass} mt-6 text-white/72 lg:mt-[max(24px,1.79cqw)]`}
                    >
                      {cardBlack.body}
                    </p>
                  </div>
                  {/* Dolma: full plate on the right, clipped at card bottom like other cards */}
                  <div
                    className="pointer-events-none absolute top-[-23px] right-[-90px] bottom-0 z-[1] hidden w-[401px] overflow-hidden sm:block lg:top-[min(-23px,-1.72cqw)] lg:right-[min(-90px,-6.73cqw)] lg:w-[max(401px,29.97cqw)]"
                    aria-hidden
                  >
                    <div
                      data-node-id="41:229"
                      className="absolute top-0 right-[90px] h-[205px] w-[311px] lg:right-[max(90px,6.73cqw)] lg:h-[max(205px,15.32cqw)] lg:w-[max(311px,23.24cqw)]"
                    >
                      <Image
                        src={DOLMA_SRC}
                        alt=""
                        width={1280}
                        height={698}
                        quality={100}
                        unoptimized
                        sizes="(min-width: 1440px) 30vw, 360px"
                        className="pointer-events-none absolute top-[-10.4%] left-[-22.72%] h-[125.12%] w-[150.27%] max-w-none"
                      />
                    </div>
                  </div>
                </article>
              </HomeStaggerItem>
            </HomeStagger>
          </div>

          {/* Tall cream card — Figma 22:336; kamancha overflows the card */}
          <HomeReveal
            delay={0.2}
            y={40}
            x={20}
            amount={0.15}
            className="lg:w-full"
          >
            <article
              data-node-id="22:336"
              className="relative z-[3] overflow-visible max-lg:min-h-[480px] lg:h-[max(787px,58.82cqw)]"
            >
              {/* Cream surface (rounded plate under the photo) */}
              <div
                className="absolute inset-0 -z-0 rounded-[30px] bg-[#efe7da]"
                aria-hidden
              />

              {/* Kamancha overflows card bounds — 41:234 @ -203,84 / 1006×703 */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 top-[22%] z-[1] lg:top-[max(84px,6.28cqw)] lg:right-auto lg:bottom-auto lg:left-[min(-203px,-15.17cqw)] lg:flex lg:h-[max(703px,52.54cqw)] lg:w-[max(1006px,75.19cqw)] lg:items-center lg:justify-center"
                aria-hidden
              >
                <div className="hidden -scale-y-100 rotate-180 lg:block">
                  <div className="relative h-[703px] w-[1006px] overflow-hidden lg:h-[max(703px,52.54cqw)] lg:w-[max(1006px,75.19cqw)]">
                    <Image
                      src={KAMANCHA_SRC}
                      alt=""
                      width={1920}
                      height={1920}
                      quality={100}
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 80vw"
                      className="pointer-events-none absolute top-[-17.9%] left-[-63.95%] h-[329.53%] w-[229.94%] max-w-none"
                    />
                  </div>
                </div>
                <div className="relative h-full w-full overflow-visible lg:hidden">
                  <Image
                    src={KAMANCHA_SRC}
                    alt=""
                    fill
                    quality={100}
                    unoptimized
                    sizes="100vw"
                    className="object-contain object-[70%_bottom]"
                  />
                </div>
              </div>

              <h3
                data-node-id="41:245"
                className={`${mosaicTitleClass} relative z-[2] px-8 pt-10 text-[#222] lg:absolute lg:top-[6.23%] lg:left-[13.85%] lg:px-0 lg:pt-0`}
              >
                {cardTall.title}
              </h3>
              <p
                data-node-id="41:247"
                className={`${mosaicBodyClass} relative z-[2] mt-6 max-w-[211px] px-8 pb-48 text-[rgba(34,34,34,0.81)] lg:absolute lg:top-[12.71%] lg:left-[13.85%] lg:mt-0 lg:max-w-[54.1%] lg:px-0 lg:pb-0`}
              >
                {cardTall.body}
              </p>
            </article>
          </HomeReveal>
        </div>
      </div>
    </section>
  );
}
