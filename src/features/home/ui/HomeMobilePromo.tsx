import Image from "next/image";

import { HomeReveal } from "@/features/home/ui/home-motion";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const PLATE_SRC = staticAssetUrl("/assets/brand/home/family-dinner-plate.webp");

type HomeMobilePromoProps = {
  headlineBefore: string;
  headlineAccent: string;
  headlineAfter: string;
};

/**
 * Mobile family-dinner teaser — Figma 196:213 (363×118).
 */
export function HomeMobilePromo({
  headlineBefore,
  headlineAccent,
  headlineAfter,
}: HomeMobilePromoProps) {
  return (
    <HomeReveal>
      <section className="relative z-[1] px-6 pt-2" data-node-id="196:213">
        <div className="relative overflow-hidden rounded-[21px] bg-white">
          <div className="relative z-[1] max-w-[62%] py-[27px] pl-[19px] pr-2">
            <h1 className="font-big-fat-boii text-[22px] leading-[23px] font-normal text-brand-forest">
              {headlineBefore ? (
                <span className="text-[rgba(38,81,39,0.6)]">
                  {headlineBefore}
                </span>
              ) : null}
              <span>{headlineAccent}</span>
              {headlineAfter ? (
                <span className="text-[rgba(38,81,39,0.6)]">
                  {headlineAfter}
                </span>
              ) : null}
            </h1>
          </div>
          <div
            className="pointer-events-none absolute top-[-14px] right-0 h-[132px] w-[56%] overflow-hidden rounded-br-[21px] rounded-bl-[15px]"
            aria-hidden
            data-node-id="196:224"
          >
            <Image
              src={PLATE_SRC}
              alt=""
              width={406}
              height={254}
              priority
              sizes="56vw"
              className="h-[192%] w-full max-w-none object-cover object-top"
            />
          </div>
        </div>
      </section>
    </HomeReveal>
  );
}
