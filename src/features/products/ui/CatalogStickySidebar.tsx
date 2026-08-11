"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const SIDEBAR_WIDTH_PX = 280;
/** Matches `top-28` under the sticky site header. */
const TOP_OFFSET_PX = 112;

type CatalogStickySidebarProps = {
  children: ReactNode;
};

/**
 * Catalog filter sidebar that stays pinned while the product grid scrolls.
 * Uses fixed positioning (CSS sticky fails under storefront overflow ancestors).
 */
export function CatalogStickySidebar({ children }: CatalogStickySidebarProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<{
    position: "relative" | "fixed";
    top: number;
    left: number;
    width: number;
  }>({
    position: "relative",
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH_PX,
  });
  const [spacerHeight, setSpacerHeight] = useState(0);

  useEffect(() => {
    function update(): void {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const layout = anchor.closest("[data-catalog-layout]");
      const anchorRect = anchor.getBoundingClientRect();
      const panelHeight = panel.offsetHeight;
      setSpacerHeight(panelHeight);

      const left = anchorRect.left;
      const width = anchorRect.width || SIDEBAR_WIDTH_PX;

      if (anchorRect.top > TOP_OFFSET_PX) {
        setStyle({
          position: "relative",
          top: 0,
          left: 0,
          width,
        });
        return;
      }

      let top = TOP_OFFSET_PX;
      if (layout) {
        const layoutBottom = layout.getBoundingClientRect().bottom;
        const maxTop = layoutBottom - panelHeight;
        top = Math.min(TOP_OFFSET_PX, maxTop);
      }

      setStyle({
        position: "fixed",
        top,
        left,
        width,
      });
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const panel = panelRef.current;
    const anchor = anchorRef.current;
    const observer = new ResizeObserver(update);
    if (panel) observer.observe(panel);
    if (anchor) observer.observe(anchor);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={anchorRef}
      className="relative hidden w-[280px] shrink-0 self-start lg:block"
      style={{ minHeight: spacerHeight || undefined }}
    >
      <div
        ref={panelRef}
        className="z-20 max-h-[calc(100dvh-8rem)] overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-transparent"
        style={{
          position: style.position,
          top: style.position === "fixed" ? style.top : undefined,
          left: style.position === "fixed" ? style.left : undefined,
          width: style.width,
        }}
      >
        {children}
      </div>
    </div>
  );
}
