"use client";

import { useEffect, useRef, useState } from "react";

import { ContactInfo } from "@/features/contact/ui/ContactInfo";
import { ContactMap } from "@/features/contact/ui/ContactMap";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactFooterProps = {
  copy: Dictionary["contact"];
};

/** Desktop: map slightly narrower than the pills row (previous behavior). */
const MAP_WIDTH_INSET_DESKTOP_PX = 64;

const DESKTOP_PILLS_MQ = "(min-width: 744px)";

/**
 * Contact pills + map.
 * Mobile: map matches pill width inside the form column.
 * Desktop: previous wider map (pills span − inset).
 */
export function ContactFooter({ copy }: ContactFooterProps) {
  const pillsRef = useRef<HTMLDivElement>(null);
  const [mapWidthPx, setMapWidthPx] = useState<number | null>(null);

  useEffect(() => {
    const pillsNode = pillsRef.current;
    if (pillsNode == null) {
      return;
    }

    const measuredNode: HTMLDivElement = pillsNode;
    const desktopMq = window.matchMedia(DESKTOP_PILLS_MQ);

    function syncWidth(): void {
      const boxes: DOMRect[] = [];
      for (const pill of measuredNode.querySelectorAll("[data-contact-pill]")) {
        const box = pill.getBoundingClientRect();
        if (box.width > 0 && box.height > 0) {
          boxes.push(box);
        }
      }

      let width = 0;
      if (boxes.length === 0) {
        width = measuredNode.getBoundingClientRect().width;
      } else {
        let minLeft = Number.POSITIVE_INFINITY;
        let maxRight = Number.NEGATIVE_INFINITY;
        for (const box of boxes) {
          minLeft = Math.min(minLeft, box.left);
          maxRight = Math.max(maxRight, box.right);
        }
        width = maxRight - minLeft;
      }

      if (width <= 0) {
        return;
      }

      const inset = desktopMq.matches ? MAP_WIDTH_INSET_DESKTOP_PX : 0;
      setMapWidthPx(Math.round(Math.max(0, width - inset)));
    }

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(measuredNode);
    desktopMq.addEventListener("change", syncWidth);
    return () => {
      observer.disconnect();
      desktopMq.removeEventListener("change", syncWidth);
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[633px] flex-col items-center min-[744px]:max-w-none">
      <div ref={pillsRef} className="w-full min-[744px]:w-fit">
        <ContactInfo copy={copy} />
      </div>
      <div
        className="mt-12 w-full max-w-full sm:mt-14 xl:mt-18"
        style={
          mapWidthPx != null
            ? { width: `min(100%, ${mapWidthPx}px)` }
            : undefined
        }
      >
        <ContactMap
          title={copy.mapTitle}
          tumanyanLabel={copy.storeAddress}
          saryanLabel={copy.storeAddress2}
          unavailableLabel={copy.mapUnavailable}
        />
      </div>
    </div>
  );
}
