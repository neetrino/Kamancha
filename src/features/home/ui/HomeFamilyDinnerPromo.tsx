import Image from "next/image";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";

const PLATE_SRC = "/assets/brand/home/family-dinner-plate.webp";
const RUGS_SRC = "/assets/brand/home/family-dinner-rugs.webp";

type HomeFamilyDinnerPromoProps = {
  headlineBefore: string;
  headlineAccent: string;
  headlineAfter: string;
  subtitle: string;
  subtitleMuted: string;
  priceLabel: string;
  ctaLabel: string;
  ctaHref: string;
};

/**
 * Family dinner promo — Figma Frame 187 / 22:219 (1313×522).
 * Rugs (22:221) overflow above/outside the white banner onto the green field.
 */
export function HomeFamilyDinnerPromo({
  headlineBefore,
  headlineAccent,
  headlineAfter,
  subtitle,
  subtitleMuted,
  priceLabel,
  ctaLabel,
  ctaHref,
}: HomeFamilyDinnerPromoProps) {
  return (
    <section className="relative z-[2] overflow-visible pt-20 pb-8 sm:pt-24 sm:pb-10 md:pt-[7.5rem] md:pb-12">
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible px-5">
        <div className="relative ml-0 w-full max-w-[1313px]">
        <div
          data-node-id="22:219"
          className="relative z-0 w-full rounded-[30px] bg-white md:aspect-[1313/522]"
        >
          {/* Plate — Figma 22:220 @ 393,36 / 701×486, rounded-bl 261 */}
          <div
            className="pointer-events-none absolute top-[6.9%] left-[29.9%] z-[1] hidden h-[93.1%] w-[53.4%] overflow-hidden rounded-bl-[min(261px,20vw)] md:block"
            aria-hidden
          >
            <Image
              src={PLATE_SRC}
              alt=""
              width={1402}
              height={1747}
              sizes="(max-width: 1313px) 55vw, 701px"
              className="pointer-events-none absolute top-[-0.04%] left-0 h-[179.96%] w-full max-w-none"
            />
          </div>

          <div className="relative z-10 flex w-full flex-col px-8 pt-12 pb-4 sm:px-12 md:absolute md:inset-0 md:block md:px-0 md:pt-0 md:pb-0">
            <h2
              data-node-id="22:222"
              className="max-w-[813px] font-big-fat-boii text-[clamp(28px,4.4vw,58px)] leading-[1.05] font-normal text-brand-forest md:absolute md:top-[12.45%] md:left-[4.87%] md:w-[61.9%] md:leading-[60px]"
            >
              <span className="text-[rgba(38,81,39,0.6)]">{headlineBefore}</span>
              <span>{headlineAccent}</span>
              <span className="text-[rgba(38,81,39,0.6)]">{headlineAfter}</span>
            </h2>

            <p
              data-node-id="22:223"
              className="mt-6 text-[16px] leading-6 text-black sm:text-[18px] md:absolute md:top-[43.1%] md:left-[5.64%] md:mt-0 md:whitespace-nowrap"
            >
              <span className="block">{subtitle}</span>
              <span className="block text-black/42">{subtitleMuted}</span>
            </p>

            <p
              data-node-id="22:224"
              className="mt-6 font-big-fat-boii text-[36px] leading-[1.05] font-normal whitespace-nowrap text-brand-forest sm:text-[42px] md:absolute md:top-[56.9%] md:left-[5.64%] md:mt-0 md:text-[48px] md:leading-[50px]"
            >
              {priceLabel}
            </p>

            <div className="mt-8 w-full max-w-[316px] md:absolute md:top-[73.37%] md:left-[4.87%] md:mt-0">
              <KamanchaPillButton
                href={ctaHref}
                label={ctaLabel}
                variant="dark"
                figmaNodeId="22:225"
                className="w-full max-w-[316px]"
              />
            </div>
          </div>

          <div className="relative z-10 px-6 pb-10 md:hidden">
            <div className="relative mx-auto aspect-[5/4] w-full max-w-md overflow-hidden rounded-[24px] rounded-bl-[140px]">
              <Image
                src={PLATE_SRC}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>

        {/* Rugs outside the white card — Figma 22:221 @ 865,-271 / 668×793 */}
        <div
          className="pointer-events-none absolute top-[-51.92%] left-[65.88%] z-20 hidden h-[151.92%] w-[50.88%] overflow-hidden md:block"
          aria-hidden
        >
          <Image
            src={RUGS_SRC}
            alt=""
            width={1336}
            height={2009}
            sizes="(max-width: 1313px) 40vw, 668px"
            className="pointer-events-none absolute top-[-0.04%] left-0 h-[128.57%] w-[101.5%] max-w-none"
          />
        </div>

        <div
          className="pointer-events-none absolute right-[-2%] bottom-[-8%] z-20 h-[48%] w-[52%] md:hidden"
          aria-hidden
        >
          <Image
            src={RUGS_SRC}
            alt=""
            fill
            sizes="50vw"
            className="object-contain object-bottom"
          />
        </div>
        </div>
      </div>
    </section>
  );
}
