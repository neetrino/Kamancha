import Image from "next/image";

import { ABOUT_HERO_IMAGE } from "@/features/about/content/about-assets";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AboutHeroProps = {
  copy: Dictionary["about"];
};

export function AboutHero({ copy }: AboutHeroProps) {
  return (
    <section className="py-6 md:py-10">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="relative h-[320px] w-full overflow-hidden rounded-[15px] sm:h-[400px] md:h-[480px] lg:h-[560px]">
          <Image
            src={ABOUT_HERO_IMAGE}
            alt={copy.heroImageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="space-y-5 md:space-y-6">
          <p className="text-sm font-semibold tracking-[0.12em] text-[#9DB568] uppercase md:text-base">
            {copy.eyebrow}
          </p>
          <h1 className="font-big-fat-boii text-4xl leading-tight font-normal tracking-wide text-white md:text-5xl lg:text-[58px] lg:leading-[1.1]">
            {copy.title}
          </h1>
          <div className="space-y-4 text-base leading-relaxed text-white/70 md:text-lg">
            {copy.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
