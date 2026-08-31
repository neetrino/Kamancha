"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SIDEBAR_WIDTH_PX = 280;
/** Space between sticky header bottom and the category sidebar. */
const HEADER_GAP_PX = 28;
const FALLBACK_TOP_OFFSET_PX = 140;
const THUMB_MIN_PX = 20;
const THUMB_MAX_PX = 70;
/** Gap between custom scrollbar and category list. */
const SCROLLBAR_GAP_PX = 12;

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
 * Custom left scrollbar appears on hover without shifting the 280px filter column.
 */
export function CatalogStickySidebar({ children }: CatalogStickySidebarProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [thumb, setThumb] = useState({
    top: 0,
    height: 0,
    canScroll: false,
  });
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
    width: SIDEBAR_WIDTH_PX,
    maxHeight: 0,
  });
  const [spacerHeight, setSpacerHeight] = useState(0);

  const syncThumb = useCallback((): void => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScroll = scrollHeight > clientHeight + 1;
    if (!canScroll) {
      setThumb({ top: 0, height: 0, canScroll: false });
      return;
    }
    const proportional = (clientHeight / scrollHeight) * clientHeight;
    const height = Math.min(
      THUMB_MAX_PX,
      Math.max(THUMB_MIN_PX, proportional * 0.55),
    );
    const maxTop = Math.max(0, clientHeight - height);
    const top =
      scrollHeight === clientHeight
        ? 0
        : (scrollTop / (scrollHeight - clientHeight)) * maxTop;
    setThumb({ top, height, canScroll: true });
  }, []);

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
        syncThumb();
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
      syncThumb();
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const panel = panelRef.current;
    const anchor = anchorRef.current;
    const scroll = scrollRef.current;
    const observer = new ResizeObserver(update);
    if (panel) observer.observe(panel);
    if (anchor) observer.observe(anchor);
    if (scroll) observer.observe(scroll);

    const header = document.querySelector("[data-site-header]");
    if (header) observer.observe(header);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [syncThumb]);

  return (
    <div
      ref={anchorRef}
      className="relative hidden w-[280px] shrink-0 self-start xl:block"
      style={{ minHeight: spacerHeight || undefined }}
    >
      <div
        ref={panelRef}
        className="z-20"
        style={{
          position: style.position,
          top: style.position === "fixed" ? style.top : undefined,
          left: style.position === "fixed" ? style.left : undefined,
          width: style.width,
          maxHeight: style.maxHeight || undefined,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={`catalog-sidebar-rail absolute top-0 bottom-0 w-1 overflow-hidden transition-opacity duration-150 ${
            hovered && thumb.canScroll ? "opacity-100" : "opacity-0"
          }`}
          style={{ right: `calc(100% + ${SCROLLBAR_GAP_PX}px)` }}
          aria-hidden
        >
          <div
            className="absolute inset-x-0 rounded-full bg-white/40"
            style={{
              top: thumb.top,
              height: thumb.height,
            }}
          />
        </div>
        <div
          ref={scrollRef}
          className="catalog-sidebar-scroll h-full min-h-0 w-full overflow-y-auto overscroll-contain"
          style={{ maxHeight: style.maxHeight || undefined }}
          onScroll={syncThumb}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
