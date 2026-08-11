import { AppLink } from "@/components/ui/AppLink";
import type { Locale } from "@/lib/i18n/config";

type CatalogPageHeaderProps = {
  locale: Locale;
  breadcrumbLabel: string;
  homeLabel: string;
  productsLabel: string;
  heading: string;
  resultsLabel: string;
};

/**
 * Catalog page intro — Figma Container 103:2412 (breadcrumb, H1, results count).
 */
export function CatalogPageHeader({
  locale,
  breadcrumbLabel,
  homeLabel,
  productsLabel,
  heading,
  resultsLabel,
}: CatalogPageHeaderProps) {
  return (
    <header
      data-node-id="103:2412"
      className="flex flex-col items-start pb-8 pt-2 sm:pt-4 md:pb-8 md:pt-2"
    >
      <nav
        aria-label={breadcrumbLabel}
        className="flex items-center gap-3"
        data-node-id="103:2413"
      >
        <AppLink
          href={`/${locale}`}
          prefetchPolicy="intent"
          className="text-sm leading-[21px] text-white/50 transition-colors hover:text-white/80"
        >
          {homeLabel}
        </AppLink>
        <span
          aria-hidden="true"
          className="text-base leading-6 tracking-[-0.3125px] text-white/30"
        >
          /
        </span>
        <span
          aria-current="page"
          className="text-sm leading-[21px] font-semibold text-white"
        >
          {productsLabel}
        </span>
      </nav>

      <h1
        data-node-id="103:2420"
        className="pt-4 font-big-fat-boii text-[40px] leading-[1.1] font-normal text-white uppercase sm:text-[48px] md:text-[58px] md:leading-[80px]"
      >
        {heading}
      </h1>

      <p
        data-node-id="103:2422"
        className="pt-2 text-base leading-6 text-white/60"
      >
        {resultsLabel}
      </p>
    </header>
  );
}
