import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { RestaurantVenueCard } from "@/features/home/ui/RestaurantVenueCard";
import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const HUB = "/assets/brand/hub";
const SAME_ORIGIN = { sameOrigin: true } as const;

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
 * Kamancha restaurants list — Figma 704:4019 / background 704:4020.
 */
export function RestaurantsPageView({ locale, labels }: RestaurantsPageViewProps) {
  return (
    <section
      className="restaurants-page -mx-4 sm:-mx-6 xl:-mx-8 xl:-my-10"
      data-node-id="704:4019"
    >
      <div className="mx-auto flex w-full max-w-[397px] flex-col gap-5 px-[15px] sm:px-6">
        <AppLink
          href={`/${locale}`}
          prefetchPolicy="intent"
          aria-label={labels.back}
          className="inline-flex w-[64px] shrink-0"
        >
          <Image
            src={staticAssetUrl(`${HUB}/back-chevron.svg`, SAME_ORIGIN)}
            alt=""
            width={64}
            height={43}
            unoptimized
            data-node-id="704:4040"
          />
        </AppLink>

        <div className="flex flex-col gap-5" data-node-id="704:4021">
          <RestaurantVenueCard
            title={labels.tumanyan}
            titleClassName="top-[calc(50%+63px)] right-[21px]"
            photoSrc={staticAssetUrl(`${HUB}/venue-tumanyan.webp`, SAME_ORIGIN)}
            photoWidth={413}
            photoHeight={463}
            photoClassName="absolute top-[-69px] left-1/2 h-[463px] min-w-full w-[413px] -translate-x-1/2 object-cover"
            photoNodeId="704:4023"
            logoSrc={staticAssetUrl(`${HUB}/kamancha-script-venue.svg`, SAME_ORIGIN)}
            logoWidth={247}
            logoHeight={133}
            logoClassName="top-[18px] left-5"
          />
          <RestaurantVenueCard
            title={labels.saryan}
            titleClassName="top-[calc(50%+67px)] right-[41px]"
            photoSrc={staticAssetUrl(`${HUB}/venue-saryan.webp`, SAME_ORIGIN)}
            photoWidth={397}
            photoHeight={531}
            photoClassName="absolute top-[-15px] left-0 h-[531px] w-full object-cover object-bottom"
            photoNodeId="704:4027"
            logoSrc={staticAssetUrl(`${HUB}/tapaka-logo.webp`, SAME_ORIGIN)}
            logoWidth={284}
            logoHeight={160}
            logoClassName="top-[9px] left-[15px] h-[160px] w-[284px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.9)]"
          />
          <RestaurantVenueCard
            title={labels.blog}
            titleClassName="top-[181px] right-[37px]"
            photoSrc={staticAssetUrl(`${HUB}/venue-blog.webp`, SAME_ORIGIN)}
            photoWidth={398}
            photoHeight={496}
            photoClassName="absolute top-[calc(50%+76px)] left-1/2 h-[496px] min-w-full w-[398px] -translate-x-1/2 -translate-y-1/2 object-cover"
            photoNodeId="704:4030"
          />
        </div>
      </div>
    </section>
  );
}
