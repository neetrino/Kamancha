import { HomeDiamondMark } from "@/features/home/ui/HomeDiamondMark";
import { HomeReveal } from "@/features/home/ui/home-motion";

type HomeSectionHeadingProps = {
  title: string;
  figmaNodeId?: string;
  /** White on forest; switches to forest on white from 744px (iPad). */
  invertOnTablet?: boolean;
};

/**
 * Mobile home section title — diamond mark + Big Fat Boii heading.
 */
export function HomeSectionHeading({
  title,
  figmaNodeId,
  invertOnTablet = false,
}: HomeSectionHeadingProps) {
  const titleClass = invertOnTablet
    ? "font-big-fat-boii text-[28px] leading-none font-normal text-white min-[744px]:text-brand-forest"
    : "font-big-fat-boii text-[28px] leading-none font-normal text-white";

  return (
    <HomeReveal>
      <div className="flex flex-col items-center gap-2">
        {invertOnTablet ? (
          <>
            <HomeDiamondMark tone="light" className="min-[744px]:hidden" />
            <HomeDiamondMark tone="forest" className="hidden min-[744px]:block" />
          </>
        ) : (
          <HomeDiamondMark tone="light" />
        )}
        <h2 data-node-id={figmaNodeId} className={titleClass}>
          {title}
        </h2>
      </div>
    </HomeReveal>
  );
}
