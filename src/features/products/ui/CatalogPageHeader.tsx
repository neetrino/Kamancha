type CatalogPageHeaderProps = {
  heading: string;
  resultsLabel: string;
};

/**
 * Catalog page intro — Figma Container 103:2412 (H1, results count).
 */
export function CatalogPageHeader({
  heading,
  resultsLabel,
}: CatalogPageHeaderProps) {
  return (
    <header
      data-node-id="103:2412"
      className="flex flex-col items-start pb-8 pt-2 sm:pt-4 md:pb-8 md:pt-2"
    >
      <h1
        data-node-id="103:2420"
        className="font-big-fat-boii text-[40px] leading-[1.1] font-normal text-white sm:text-[48px] md:text-[58px] md:leading-[80px]"
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
