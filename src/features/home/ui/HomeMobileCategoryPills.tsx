"use client";

import { useLayoutEffect, useRef } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { HOME_HORIZONTAL_SCROLL } from "@/features/home/ui/home-motion";
import type { HomeMobileCategorySlide } from "@/features/home/ui/HomeMobilePlateWheel";

const PILL_INSET_PX = 24;

type HomeMobileCategoryPillsProps = {
  categories: readonly HomeMobileCategorySlide[];
  index: number;
};

function pillClassName(active: boolean): string {
  return `rounded-[50px] px-4 py-2 text-[16px] leading-6 whitespace-nowrap transition-colors ${
    active
      ? "bg-white font-semibold text-[rgba(34,34,34,0.9)]"
      : "bg-white/10 font-normal text-white/90 hover:bg-white/15"
  }`;
}

function scrollActivePillIntoView(scroller: HTMLElement): void {
  const selected = scroller.querySelector<HTMLElement>(
    '[data-active-home-category-pill="true"]',
  );
  if (!selected) {
    return;
  }

  const delta =
    selected.getBoundingClientRect().left -
    scroller.getBoundingClientRect().left -
    PILL_INSET_PX;
  scroller.scrollTo({
    left: scroller.scrollLeft + delta,
    behavior: "smooth",
  });
}

/**
 * Scrollable category pills — browse by horizontal scroll; tap opens the menu.
 * Active pill follows the plate carousel (arrows / plate swipe), not pill scroll.
 */
export function HomeMobileCategoryPills({
  categories,
  index,
}: HomeMobileCategoryPillsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scrollActivePillIntoView(scroller);
  }, [index, categories]);

  return (
    <div
      ref={scrollerRef}
      data-node-id="196:205"
      className={`${HOME_HORIZONTAL_SCROLL} overflow-y-clip`}
    >
      <div className="flex w-max items-center gap-2 px-6">
        {categories.map((category, categoryIndex) => {
          const active = categoryIndex === index;

          return (
            <AppLink
              key={category.id}
              href={category.href}
              prefetchPolicy="intent"
              aria-current={active ? "page" : undefined}
              data-active-home-category-pill={active ? "true" : undefined}
              className={pillClassName(active)}
            >
              {category.title}
            </AppLink>
          );
        })}
      </div>
    </div>
  );
}
