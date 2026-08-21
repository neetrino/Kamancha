import { Reveal } from "@/components/ui/RevealMotion";

type CatalogPageHeaderProps = {
  heading: string;
  resultsLabel: string;
  headingSize?: "default" | "compact";
};

const HEADING_SIZE_CLASS = {
  default:
    "font-big-fat-boii text-[40px] leading-[1.1] font-normal text-white sm:text-[48px] md:text-[58px] md:leading-[80px]",
  compact:
    "font-big-fat-boii text-[32px] leading-[1.1] font-normal text-white sm:text-[40px] md:text-[48px] md:leading-[1.15]",
} as const;

/**
 * Catalog page intro — Figma Container 103:2412 (H1, results count).
 */
export function CatalogPageHeader({
  heading,
  resultsLabel,
  headingSize = "default",
}: CatalogPageHeaderProps) {
  return (
    <header
      data-node-id="103:2412"
      className="flex flex-col items-start pb-8 pt-2 sm:pt-4 md:pb-8 md:pt-2"
    >
      <Reveal immediate>
        <h1 data-node-id="103:2420" className={HEADING_SIZE_CLASS[headingSize]}>
          {heading}
        </h1>
      </Reveal>

      <Reveal immediate delay={0.08} y={16}>
        <p
          data-node-id="103:2422"
          className="pt-2 text-base leading-6 text-white/60"
        >
          {resultsLabel}
        </p>
      </Reveal>
    </header>
  );
}
