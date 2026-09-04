"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { HomeCategorySwitchers } from "@/features/home/ui/HomeCategorySwitchers";
import {
  HOME_HORIZONTAL_SCROLL,
  HomeReveal,
} from "@/features/home/ui/home-motion";

type HomeScrollRailProps = {
  title: string;
  titleNodeId?: string;
  previousLabel: string;
  nextLabel: string;
  children: ReactNode;
  /**
   * Shared horizontal inset for the title row and the card track.
   * Must match the padding class on the scroll track children.
   */
  insetClassName: string;
  titleClassName: string;
  headerClassName?: string;
};

function readScrollStep(scroller: HTMLElement): number {
  const track = scroller.firstElementChild;
  const first = track?.children.item(0);
  const second = track?.children.item(1);
  if (first instanceof HTMLElement && second instanceof HTMLElement) {
    return second.offsetLeft - first.offsetLeft;
  }
  if (first instanceof HTMLElement) {
    return first.offsetWidth;
  }
  return Math.round(scroller.clientWidth * 0.75);
}

/**
 * Desktop home card rail — title left, switchers right, aligned to card inset.
 */
export function HomeScrollRail({
  title,
  titleNodeId,
  previousLabel,
  nextLabel,
  children,
  insetClassName,
  titleClassName,
  headerClassName = "mb-10 sm:mb-11 md:mb-[42px]",
}: HomeScrollRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = useCallback((): void => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    setCanPrev(scroller.scrollLeft > 1);
    setCanNext(scroller.scrollLeft < maxScroll - 1);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    updateEdges();
    scroller.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [updateEdges, children]);

  function scrollByDirection(direction: -1 | 1): void {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    scroller.scrollBy({
      left: direction * readScrollStep(scroller),
      behavior: "smooth",
    });
  }

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
      <HomeReveal>
        <div
          className={`flex items-center justify-between gap-6 ${insetClassName} ${headerClassName}`}
        >
          <h2
            data-node-id={titleNodeId}
            className={`min-w-0 text-left ${titleClassName}`}
          >
            {title}
          </h2>
          <HomeCategorySwitchers
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={() => scrollByDirection(-1)}
            onNext={() => scrollByDirection(1)}
          />
        </div>
      </HomeReveal>

      <div ref={scrollerRef} className={HOME_HORIZONTAL_SCROLL}>
        {children}
      </div>
    </div>
  );
}
