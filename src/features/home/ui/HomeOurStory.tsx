import Image from "next/image";

const PLATE_SRC = "/assets/brand/home/family-dinner-plate.webp";
const GRAPES_SRC = "/assets/brand/home/our-story/grapes-jug.webp";
const DOLMA_SRC = "/assets/brand/home/our-story/dolma.webp";
const KAMANCHA_SRC = "/assets/brand/home/our-story/kamancha.webp";
const RUG_SRC = "/assets/brand/home/our-story/rug.webp";

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
      className="relative z-[1] overflow-visible pt-14 pb-10 sm:pt-16 md:pt-20 md:pb-8"
    >
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible px-5">
        {/* Angled rug — Figma 22:186, diagonal behind mosaic (~65° CW) */}
        <div
          data-node-id="22:186"
          className="pointer-events-none absolute top-[-12%] right-[-8%] left-auto z-0 hidden w-[min(70vw,980px)] md:block lg:top-[-16%] lg:right-[-4%] lg:w-[min(62vw,1100px)]"
          aria-hidden
        >
          <div className="relative aspect-[768/1024] w-full origin-center rotate-[65deg]">
            <Image
              src={RUG_SRC}
              alt=""
              fill
              sizes="(max-width: 1280px) 70vw, 1100px"
              className="object-contain drop-shadow-[0_28px_56px_rgba(0,0,0,0.4)]"
            />
          </div>
        </div>

        <div className="relative z-[1] mx-auto grid w-full max-w-[1338px] gap-10 lg:grid-cols-[minmax(0,821px)_minmax(0,390px)] lg:items-start lg:gap-[41px]">
          <div className="min-w-0 overflow-visible">
            <h2
              data-node-id="22:330"
              className="font-big-fat-boii text-[clamp(36px,5vw,58px)] leading-[1.05] font-normal text-[#e5e2e1] uppercase"
            >
              {title}
            </h2>

            <p
              data-node-id="22:331"
              className="mt-8 max-w-[650px] text-[16px] leading-[26px] text-[#c2c9bd] sm:mt-10"
            >
              {intro}
            </p>

            <p
              data-node-id="22:332"
              className="mt-6 max-w-[614px] text-[16px] leading-[26px] text-[#c2c9bd]"
            >
              {introSecond}
            </p>

            <div className="relative z-[1] mt-10 grid grid-cols-1 gap-5 overflow-visible sm:mt-12 sm:grid-cols-2 sm:gap-[41px]">
              {/* White card — 22:333 */}
              <article
                data-node-id="22:333"
                className="relative z-[1] h-[182px] overflow-visible rounded-[30px] bg-white"
              >
                <div className="relative z-10 max-w-[232px] pt-[19px] pr-4 pl-8">
                  <h3
                    data-node-id="41:239"
                    className="font-big-fat-boii text-[21px] leading-6 font-normal text-brand-forest uppercase"
                  >
                    {cardWhite.title}
                  </h3>
                  <p
                    data-node-id="41:241"
                    className="mt-4 text-[14px] leading-6 text-[rgba(38,81,39,0.69)]"
                  >
                    {cardWhite.body}
                  </p>
                </div>
                <div
                  className="pointer-events-none absolute top-[-28px] right-0 h-[210px] w-[226px] overflow-hidden rounded-br-[30px] rounded-bl-[43px]"
                  aria-hidden
                >
                  <Image
                    src={PLATE_SRC}
                    alt=""
                    width={1402}
                    height={1747}
                    sizes="226px"
                    className="absolute top-[-0.04%] left-0 h-[179.96%] w-[134.07%] max-w-none"
                  />
                </div>
              </article>

              {/* Green card — 22:334 */}
              <article
                data-node-id="22:334"
                className="relative z-[2] h-[182px] overflow-visible"
              >
                <div
                  className="absolute inset-0 rounded-[30px] bg-[#a2d39c]"
                  aria-hidden
                />
                <div className="relative z-10 max-w-[min(178px,46%)] overflow-hidden pt-6 pr-2 pl-[29px]">
                  <h3
                    data-node-id="41:243"
                    className="truncate font-big-fat-boii text-[21px] leading-6 font-normal text-[#222] uppercase"
                  >
                    {cardGreen.title}
                  </h3>
                  <p
                    data-node-id="41:244"
                    className="mt-4 line-clamp-4 text-[14px] leading-6 text-black/59"
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
                    sizes="(max-width: 768px) 40vw, 239px"
                    className="pointer-events-none absolute top-0 left-0 h-[132.46%] w-full max-w-none"
                  />
                </div>
              </article>

              {/* Black wide card — 22:335 */}
              <article
                data-node-id="22:335"
                className="relative z-[1] h-[182px] overflow-visible sm:col-span-2"
              >
                <div
                  className="absolute inset-0 rounded-[30px] bg-black"
                  aria-hidden
                />
                <div className="relative z-10 max-w-[463px] pt-[26px] pr-4 pl-[31px]">
                  <h3
                    data-node-id="41:238"
                    className="font-big-fat-boii text-[21px] leading-6 font-normal text-[#e5e2e1] uppercase"
                  >
                    {cardBlack.title}
                  </h3>
                  <p
                    data-node-id="41:228"
                    className="mt-6 text-[14px] leading-6 text-white/72"
                  >
                    {cardBlack.body}
                  </p>
                </div>
                {/* Dolma: full plate on the right, clipped at card bottom like other cards */}
                <div
                  className="pointer-events-none absolute top-[-23px] right-[-90px] bottom-0 z-[1] hidden w-[401px] overflow-hidden sm:block"
                  aria-hidden
                >
                  <div
                    data-node-id="41:229"
                    className="absolute top-0 right-[90px] h-[205px] w-[311px]"
                  >
                    <Image
                      src={DOLMA_SRC}
                      alt=""
                      width={1280}
                      height={698}
                      quality={100}
                      unoptimized
                      sizes="360px"
                      className="pointer-events-none absolute top-[-10.4%] left-[-22.72%] h-[125.12%] w-[150.27%] max-w-none"
                    />
                  </div>
                </div>
              </article>
            </div>
          </div>

          {/* Tall cream card — Figma 22:336; kamancha overflows the card */}
          <article
            data-node-id="22:336"
            className="relative z-[3] overflow-visible max-lg:min-h-[480px] lg:h-[787px] lg:w-full lg:max-w-[390px] lg:justify-self-end"
          >
            {/* Cream surface (rounded plate under the photo) */}
            <div
              className="absolute inset-0 -z-0 rounded-[30px] bg-[#efe7da]"
              aria-hidden
            />

            {/* Kamancha overflows card bounds — 41:234 @ -203,84 / 1006×703 */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 top-[22%] z-[1] lg:top-[84px] lg:right-auto lg:bottom-auto lg:left-[-203px] lg:flex lg:h-[703px] lg:w-[1006px] lg:items-center lg:justify-center"
              aria-hidden
            >
              <div className="hidden -scale-y-100 rotate-180 lg:block">
                <div className="relative h-[703px] w-[1006px] overflow-hidden">
                  <Image
                    src={KAMANCHA_SRC}
                    alt=""
                    width={1920}
                    height={1920}
                    quality={100}
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 1400px"
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
              className="relative z-[2] px-8 pt-10 font-big-fat-boii text-[21px] leading-6 font-normal text-[#222] uppercase lg:absolute lg:top-[49px] lg:left-[54px] lg:px-0 lg:pt-0"
            >
              {cardTall.title}
            </h3>
            <p
              data-node-id="41:247"
              className="relative z-[2] mt-6 max-w-[211px] px-8 pb-48 text-[14px] leading-6 text-[rgba(34,34,34,0.81)] lg:absolute lg:top-[100px] lg:left-[54px] lg:mt-0 lg:px-0 lg:pb-0"
            >
              {cardTall.body}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
