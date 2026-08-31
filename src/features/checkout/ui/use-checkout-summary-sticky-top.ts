"use client";

import { useEffect, useState } from "react";

const SUMMARY_HEADER_GAP_PX = 16;
const SUMMARY_FALLBACK_TOP_PX = 140;

export function useCheckoutSummaryStickyTop(): number {
  const [top, setTop] = useState(SUMMARY_FALLBACK_TOP_PX);

  useEffect(() => {
    function update(): void {
      const header = document.querySelector<HTMLElement>("[data-site-header]");
      if (!header) {
        setTop(SUMMARY_FALLBACK_TOP_PX);
        return;
      }
      setTop(
        Math.round(header.getBoundingClientRect().bottom + SUMMARY_HEADER_GAP_PX),
      );
    }

    update();
    window.addEventListener("resize", update);
    const header = document.querySelector("[data-site-header]");
    const observer = header ? new ResizeObserver(update) : null;
    if (header && observer) observer.observe(header);

    return () => {
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  return top;
}
