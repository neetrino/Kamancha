"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const SIDEBAR_WIDTH_PX = 280;
/** Room for the visible scrollbar beside the filter (not over it). */
const SIDEBAR_SCROLLBAR_GUTTER_PX = 10;
const SIDEBAR_OUTER_WIDTH_PX = SIDEBAR_WIDTH_PX + SIDEBAR_SCROLLBAR_GUTTER_PX;
/** Space between sticky header bottom and the category sidebar. */
const HEADER_GAP_PX = 28;
const FALLBACK_TOP_OFFSET_PX = 140;

type CatalogStickySidebarProps = {
  children: ReactNode;
};

function readHeaderBottom(): number {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  if (!header) return FALLBACK_TOP_OFFSET_PX - HEADER_GAP_PX;
  return header.getBoundingClientRect().bottom;
}

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
    maxHeight: number;
  }>({
    position: "relative",
    top: 0,
    left: 0,
    width: SIDEBAR_OUTER_WIDTH_PX,
    maxHeight: 0,
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
      const width = Math.max(
        anchorRect.width || SIDEBAR_OUTER_WIDTH_PX,
        SIDEBAR_OUTER_WIDTH_PX,
      );
      const topOffset = readHeaderBottom() + HEADER_GAP_PX;
      const viewportBottomPad = 24;
      const maxHeight = Math.max(
        160,
        window.innerHeight - topOffset - viewportBottomPad,
      );

      if (anchorRect.top > topOffset) {
        setStyle({
          position: "relative",
          top: 0,
          left: 0,
          width,
          maxHeight,
        });
        return;
      }

      let top = topOffset;
      if (layout) {
        const layoutBottom = layout.getBoundingClientRect().bottom;
        const maxTop = layoutBottom - Math.min(panelHeight, maxHeight);
        top = Math.min(topOffset, maxTop);
      }

      setStyle({
        position: "fixed",
        top,
        left,
        width,
        maxHeight,
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

    const header = document.querySelector("[data-site-header]");
    if (header) observer.observe(header);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={anchorRef}
      className="relative hidden w-[290px] shrink-0 self-start xl:block"
      style={{ minHeight: spacerHeight || undefined }}
    >
      <div
        ref={panelRef}
        className="catalog-sidebar-scroll z-20 overflow-y-auto overscroll-contain pr-2.5"
        style={{
          position: style.position,
          top: style.position === "fixed" ? style.top : undefined,
          left: style.position === "fixed" ? style.left : undefined,
          width: style.width,
          maxHeight: style.maxHeight || undefined,
        }}
      >
        <div className="w-[280px] max-w-[280px]">{children}</div>
      </div>
    </div>
  );
}
