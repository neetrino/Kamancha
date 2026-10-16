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
 * Restaurants list — mobile 704:4019, desktop 704:4230.
 */
export function RestaurantsPageView({ locale, labels }: RestaurantsPageViewProps) {
  return (
    <section
      className="restaurants-page -mx-4 sm:-mx-6 xl:-mx-8 xl:-my-10"
      data-node-id="704:4019"
    >
      <div className="mx-auto flex w-full max-w-[397px] flex-col gap-5 px-[15px] sm:px-6 xl:max-w-[1302px] xl:gap-8 xl:px-0">
        <AppLink
          href={`/${locale}`}
          prefetchPolicy="intent"
          aria-label={labels.back}
          className="inline-flex w-[64px] shrink-0 xl:hidden"
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

        <div
          className="flex flex-col gap-5 xl:grid xl:grid-cols-2 xl:gap-x-[31px] xl:gap-y-[35px]"
          data-node-id="709:4353"
        >
          <RestaurantVenueCard
            title={labels.tumanyan}
            titleClassName="top-[calc(50%+63px)] right-[21px] xl:top-[calc(50%+106.5px)] xl:right-[43px] xl:text-[54px]"
            className="xl:h-[343px]"
            photoSrc={staticAssetUrl(`${HUB}/venue-tumanyan.webp`, SAME_ORIGIN)}
            photoWidth={413}
            photoHeight={463}
            photoClassName="absolute top-[-69px] left-1/2 h-[463px] min-w-full w-[413px] -translate-x-1/2 object-cover xl:top-[-103px] xl:h-[713px] xl:w-[636px]"
            photoNodeId="704:4023"
            logoSrc={staticAssetUrl(`${HUB}/kamancha-script-venue.svg`, SAME_ORIGIN)}
            logoWidth={247}
            logoHeight={133}
            logoClassName="top-[18px] left-5"
            logoXlSrc={staticAssetUrl(`${HUB}/kamancha-script-venue-xl.svg`, SAME_ORIGIN)}
            logoXlWidth={339}
            logoXlHeight={181}
            logoXlClassName="top-[34px] left-[37px]"
          />
          <RestaurantVenueCard
            title={labels.saryan}
            titleClassName="top-[calc(50%+67px)] right-[41px] xl:top-[calc(50%+114.5px)] xl:right-[38px] xl:text-[54px]"
            className="xl:h-[343px]"
            photoSrc={staticAssetUrl(`${HUB}/venue-saryan.webp`, SAME_ORIGIN)}
            photoWidth={397}
            photoHeight={531}
            photoClassName="absolute top-[-15px] left-0 h-[531px] w-full object-cover object-bottom xl:top-[-2px] xl:left-[-1px] xl:h-[849px] xl:w-[634px]"
            photoNodeId="704:4027"
            logoSrc={staticAssetUrl(`${HUB}/tapaka-logo.webp`, SAME_ORIGIN)}
            logoWidth={284}
            logoHeight={160}
            logoClassName="top-[9px] left-[15px] h-[160px] w-[284px] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.9)] xl:top-[5px] xl:left-[19px] xl:h-[210px] xl:w-[374px]"
          />
          <div className="xl:col-span-2 xl:flex xl:justify-center">
            <RestaurantVenueCard
              title={labels.blog}
              titleClassName="top-[181px] right-[37px] xl:top-[241px] xl:right-[39px]"
              className="xl:h-[301px] xl:w-[577px]"
              photoSrc={staticAssetUrl(`${HUB}/venue-blog.webp`, SAME_ORIGIN)}
              photoWidth={398}
              photoHeight={496}
              photoClassName="absolute top-[calc(50%+76px)] left-1/2 h-[496px] min-w-full w-[398px] -translate-x-1/2 -translate-y-1/2 object-cover xl:top-[calc(50%+129px)] xl:h-[723px] xl:w-[578px]"
              photoNodeId="704:4030"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
