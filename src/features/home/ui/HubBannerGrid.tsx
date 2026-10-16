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
      className="mx-auto grid w-full max-w-[1312px] grid-cols-1 gap-[18px] px-[15px] sm:px-6 xl:grid-cols-[repeat(24,minmax(0,1fr))] xl:gap-6 xl:px-16"
      data-node-id="704:4047"
    >
      <div className="xl:col-span-12">
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
      <div className="xl:col-span-12">
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
      <div className="xl:col-span-15">
        <HubBannerCard
          href="https://restormania.am"
          label={labels.blog}
          photoSrc={staticAssetUrl(`${HUB}/restormania.webp`, sameOrigin)}
          logo={<RestormaniaHubMark />}
          iconSrc={staticAssetUrl(`${HUB}/icon-news.svg`, sameOrigin)}
          className="xl:h-[335px]"
          photoNodeId="704:4062"
          photoClassName="object-cover object-[center_28%]"
        />
      </div>
      <div className="xl:col-span-9">
        <HubBannerCard
          href="https://pideh.am"
          label={labels.fastFood}
          photoSrc={staticAssetUrl(`${HUB}/pideh-full.webp`, sameOrigin)}
          logoSrc={staticAssetUrl(`${HUB}/pideh-logo.svg`, sameOrigin)}
          logoWidth={110}
          logoHeight={85}
          iconSrc={staticAssetUrl(`${HUB}/icon-fastfood.svg`, sameOrigin)}
          className="xl:h-[335px]"
          photoNodeId="704:4217"
          photoClassName="object-cover object-center"
          logoClassName="top-5 left-7 h-[85px] w-[110px]"
        />
      </div>
    </div>
  );
}
