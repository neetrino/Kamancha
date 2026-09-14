"use client";

import { useEffect, useRef, useState } from "react";

import { FooterContactSocial } from "@/components/layout/FooterContactSocial";
import { ContactInfo } from "@/features/contact/ui/ContactInfo";
import { ContactMap } from "@/features/contact/ui/ContactMap";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactFooterProps = {
  copy: Dictionary["contact"];
  socialLabels: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
};

/** Desktop only: map a bit narrower than the pills row. */
const MAP_WIDTH_INSET_DESKTOP_PX = 64;

const DESKTOP_MQ = "(min-width: 744px)";

/**
 * Contact pills + map.
 * Mobile: map matches the form/pills column; social sits under the map.
 * Desktop: original sizing (pills container width − inset).
 */
export function ContactFooter({ copy, socialLabels }: ContactFooterProps) {
  const pillsRef = useRef<HTMLDivElement>(null);
  const [mapWidthPx, setMapWidthPx] = useState<number | null>(null);

  useEffect(() => {
    const pillsNode = pillsRef.current;
    if (pillsNode == null) {
      return;
    }

    const measuredNode: HTMLDivElement = pillsNode;
    const desktopMq = window.matchMedia(DESKTOP_MQ);

    function syncWidth(): void {
      const width = measuredNode.getBoundingClientRect().width;
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
      <div className="mt-10 xl:hidden">
        <FooterContactSocial
          instagramHref={copy.social.instagram}
          facebookHref={copy.social.facebook}
          tiktokHref={copy.social.tiktok}
          instagramLabel={socialLabels.instagram}
          facebookLabel={socialLabels.facebook}
          tiktokLabel={socialLabels.tiktok}
        />
      </div>
    </div>
  );
}
