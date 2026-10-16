import { HubBannerCard } from "@/features/home/ui/HubBannerCard";
import { RestormaniaHubMark } from "@/features/home/ui/RestormaniaHubMark";
import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const HUB = "/assets/brand/hub";

type HubBannerGridProps = {
  locale: Locale;
  labels: {
    restaurants: string;
    delivery: string;
    blog: string;
    fastFood: string;
  };
};

/**
 * Kamancha first-page banners (Figma 704:4043 / 704:4123).
 */
export function HubBannerGrid({ locale, labels }: HubBannerGridProps) {
  const sameOrigin = { sameOrigin: true } as const;

  return (
    <div
      className="mx-auto grid w-full max-w-[1312px] grid-cols-1 gap-[18px] px-[15px] sm:px-6 xl:grid-cols-12 xl:gap-6 xl:px-16"
      data-node-id="704:4047"
    >
      <div className="xl:col-span-6">
        <HubBannerCard
          href={`/${locale}/restaurants`}
          label={labels.restaurants}
          photoSrc={staticAssetUrl(`${HUB}/street.webp`, sameOrigin)}
          logoSrc={staticAssetUrl(`${HUB}/kamancha-script.svg`, sameOrigin)}
          logoWidth={167}
          logoHeight={87}
          iconSrc={staticAssetUrl(`${HUB}/icon-location.svg`, sameOrigin)}
          photoNodeId="704:4049"
          photoClassName="object-cover object-[center_42%]"
          logoClassName="top-3.5 left-[23px] h-[87px] w-[167px]"
        />
      </div>
      <div className="xl:col-span-6">
        <HubBannerCard
          href={`/${locale}/delivery`}
          label={labels.delivery}
          photoSrc={staticAssetUrl(`${HUB}/khorovats.webp`, sameOrigin)}
          logoSrc={staticAssetUrl(`${HUB}/factory-badge.webp`, sameOrigin)}
          logoWidth={203}
          logoHeight={82}
          iconSrc={staticAssetUrl(`${HUB}/icon-truck.svg`, sameOrigin)}
          photoNodeId="704:4056"
          photoClassName="object-cover"
          logoClassName="top-px left-0 h-[82px] w-[203px]"
        />
      </div>
      <div className="xl:col-span-8">
        <HubBannerCard
          label={labels.blog}
          photoSrc={staticAssetUrl(`${HUB}/restormania.webp`, sameOrigin)}
          logo={<RestormaniaHubMark />}
          iconSrc={staticAssetUrl(`${HUB}/icon-news.svg`, sameOrigin)}
          className="xl:h-[335px]"
          photoNodeId="704:4062"
          photoClassName="object-cover object-[center_28%]"
        />
      </div>
      <div className="xl:col-span-4">
        <HubBannerCard
          label={labels.fastFood}
          photoSrc={staticAssetUrl(`${HUB}/pideh.webp`, sameOrigin)}
          logoSrc={staticAssetUrl(`${HUB}/pideh-logo.svg`, sameOrigin)}
          logoWidth={117}
          logoHeight={90}
          iconSrc={staticAssetUrl(`${HUB}/icon-fastfood.svg`, sameOrigin)}
          className="xl:h-[335px]"
          photoNodeId="704:4120"
          photoClassName="object-cover object-bottom"
          logoClassName="top-5 left-7 h-[90px] w-[117px]"
        />
      </div>
    </div>
  );
}
