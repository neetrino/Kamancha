import { HubBannerGrid } from "@/features/home/ui/HubBannerGrid";
import { HubHandsIntro } from "@/features/home/ui/HubHandsIntro";
import type { Locale } from "@/lib/i18n/config";

type HubFirstPageProps = {
  locale: Locale;
  labels: {
    restaurants: string;
    delivery: string;
    blog: string;
    fastFood: string;
  };
};

/**
 * Brand hub: hands intro, then first-page banners.
 */
export function HubFirstPage({ locale, labels }: HubFirstPageProps) {
  return (
    <section className="hub-first-page -mx-4 sm:-mx-6 xl:-mx-8 xl:-my-10">
      <HubHandsIntro />
      <HubBannerGrid locale={locale} labels={labels} />
    </section>
  );
}
