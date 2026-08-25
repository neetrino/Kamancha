"use client";

import { useEffect, useSyncExternalStore } from "react";

import { createEdgeDisplacementDataUrl } from "@/components/ui/edge-displacement-map";

export const LIQUID_GLASS_FILTER_ID = "kamancha-liquid-glass-rim";

/** Same gate as `globals.css` — disable SVG refraction on touch GPUs. */
export const LIQUID_GLASS_TOUCH_MQ = "(hover: none) and (pointer: coarse)";

type MediaQuerySource = {
  matchMedia: (query: string) => { matches: boolean };
};

/**
 * Rim displacement stays on by default (desktop). Touch-only pointers opt out
 * so `backdrop-filter: url(#svg)` cannot drop the frost.
 */
export function canUseLiquidGlassRefraction(
  media: MediaQuerySource | null,
): boolean {
  if (!media) {
    return false;
  }
  return !media.matchMedia(LIQUID_GLASS_TOUCH_MQ).matches;
}

/** Smaller map = cheaper GPU sampling while rim bend stays readable. */
const MAP_WIDTH_PX = 240;
const MAP_HEIGHT_PX = 360;
const MAP_RADIUS_PX = 36;
const MAP_RIM_PX = 52;
/** Mild rim bend — strong enough to read as glass, weak enough not to swim. */
const DISPLACE_SCALE = 26;
/** After scroll settles, restore refraction on desktop panels only. */
const SCROLL_IDLE_MS = 140;
const SCROLLING_CLASS = "liquid-glass-scrolling";

let cachedMapUrl: string | null | undefined;

function subscribe(): () => void {
  return () => {};
}

function getClientMedia(): MediaQuerySource | null {
  return typeof window === "undefined" ? null : window;
}

function getDisplacementMap(): string | null {
  if (!canUseLiquidGlassRefraction(getClientMedia())) {
    return null;
  }
  if (cachedMapUrl !== undefined) {
    return cachedMapUrl;
  }
  cachedMapUrl = createEdgeDisplacementDataUrl({
    width: MAP_WIDTH_PX,
    height: MAP_HEIGHT_PX,
    radiusPx: MAP_RADIUS_PX,
    rimPx: MAP_RIM_PX,
  });
  return cachedMapUrl;
}

function useScrollPausesRefraction(): void {
  useEffect(() => {
    if (!canUseLiquidGlassRefraction(window)) {
      return;
    }

    const root = document.documentElement;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = (): void => {
      root.classList.add(SCROLLING_CLASS);
      if (idleTimer !== undefined) {
        clearTimeout(idleTimer);
      }
      idleTimer = setTimeout(() => {
        root.classList.remove(SCROLLING_CLASS);
        idleTimer = undefined;
      }, SCROLL_IDLE_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      if (idleTimer !== undefined) {
        clearTimeout(idleTimer);
      }
      root.classList.remove(SCROLLING_CLASS);
    };
  }, []);
}

/**
 * Document-level rim refraction for storefront glass.
 * Touch GPUs skip the SVG; scroll pauses refraction via `html.liquid-glass-scrolling`.
 */
export function LiquidGlassOptics() {
  const mapUrl = useSyncExternalStore(subscribe, getDisplacementMap, () => null);
  useScrollPausesRefraction();

  if (!mapUrl) {
    return null;
  }

  return (
    <svg
      className="pointer-events-none absolute h-px w-px overflow-visible"
      aria-hidden
    >
      <filter
        id={LIQUID_GLASS_FILTER_ID}
        x="-8%"
        y="-8%"
        width="116%"
        height="116%"
        colorInterpolationFilters="sRGB"
      >
        <feImage
          href={mapUrl}
          x="0"
          y="0"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          result="map"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={DISPLACE_SCALE}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
