import { Reveal } from "@/components/ui/RevealMotion";

type CatalogPageHeaderProps = {
  heading: string;
  headingSize?: "default" | "compact";
};

const HEADING_SIZE_CLASS = {
  default:
    "font-big-fat-boii text-[40px] leading-[1.1] font-normal text-white sm:text-[48px] md:text-[58px] md:leading-[80px]",
  compact:
    "font-big-fat-boii text-[32px] leading-[1.1] font-normal text-white sm:text-[40px] md:text-[48px] md:leading-[1.15]",
} as const;

/**
 * Catalog / wishlist page intro — heading only (Figma Container 103:2412).
 */
export function CatalogPageHeader({
  heading,
  headingSize = "default",
}: CatalogPageHeaderProps) {
  return (
    <header
      data-node-id="103:2412"
      className="flex flex-col items-start pb-4 pt-2 sm:pt-4 md:pb-8 md:pt-2"
    >
      <Reveal immediate>
        <h1 data-node-id="103:2420" className={HEADING_SIZE_CLASS[headingSize]}>
          {heading}
        </h1>
      </Reveal>
    </header>
  );
}
