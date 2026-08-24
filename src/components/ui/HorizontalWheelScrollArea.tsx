"use client";

import { useEffect, useRef, type ReactNode } from "react";

const HORIZONTAL_SCROLL_CLASS =
  "overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

type HorizontalWheelScrollAreaProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Horizontal scroll row: mouse wheel over the area scrolls sideways (iMac / mouse).
 * At the start/end edge, vertical wheel passes through to the page.
 */
export function HorizontalWheelScrollArea({
  children,
  className,
}: HorizontalWheelScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const onWheel = (event: WheelEvent): void => {
      const { deltaX, deltaY } = event;

      if (Math.abs(deltaX) > Math.abs(deltaY) || deltaY === 0) {
        return;
      }

      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      if (maxScrollLeft <= 0) {
        return;
      }

      const scrollingDown = deltaY > 0;
      const atStart = element.scrollLeft <= 0;
      const atEnd = element.scrollLeft >= maxScrollLeft - 1;

      if ((scrollingDown && atEnd) || (!scrollingDown && atStart)) {
        return;
      }

      event.preventDefault();
      element.scrollLeft += deltaY;
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  const classes = className
    ? `${HORIZONTAL_SCROLL_CLASS} ${className}`
    : HORIZONTAL_SCROLL_CLASS;

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
