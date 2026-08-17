import { HomeDiamondMark } from "@/features/home/ui/HomeDiamondMark";
import { HomeReveal } from "@/features/home/ui/home-motion";

type HomeSectionHeadingProps = {
  title: string;
  figmaNodeId?: string;
};

/**
 * Mobile home section title — diamond mark + Big Fat Boii heading.
 */
export function HomeSectionHeading({
  title,
  figmaNodeId,
}: HomeSectionHeadingProps) {
  return (
    <HomeReveal>
      <div className="flex flex-col items-center gap-2">
        <HomeDiamondMark />
        <h2
          data-node-id={figmaNodeId}
          className="font-big-fat-boii text-[28px] leading-none font-normal text-white"
        >
          {title}
        </h2>
      </div>
    </HomeReveal>
  );
}
