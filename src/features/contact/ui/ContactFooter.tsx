"use client";

import { useEffect, useRef, useState } from "react";

import { ContactInfo } from "@/features/contact/ui/ContactInfo";
import { ContactMap } from "@/features/contact/ui/ContactMap";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactFooterProps = {
  copy: Dictionary["contact"];
};

/**
 * Contact pills + map. Map width matches the pills row (first → last pill).
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

    function syncWidth(): void {
      const width = measuredNode.getBoundingClientRect().width;
      if (width > 0) {
        setMapWidthPx(Math.round(width));
      }
    }

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(measuredNode);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex w-full flex-col items-center">
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
