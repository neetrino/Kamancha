"use client";

import { useSyncExternalStore } from "react";

import { createEdgeDisplacementDataUrl } from "@/components/ui/edge-displacement-map";

export const LIQUID_GLASS_FILTER_ID = "kamancha-liquid-glass-rim";

const MAP_WIDTH_PX = 320;
const MAP_HEIGHT_PX = 480;
const MAP_RADIUS_PX = 36;
const MAP_RIM_PX = 52;
const DISPLACE_SCALE = 64;

let cachedMapUrl: string | null | undefined;

function subscribe(): () => void {
  return () => {};
}

function getDisplacementMap(): string | null {
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

/**
 * One document-level rim refraction filter for every `.liquid-glass` card.
 */
export function LiquidGlassOptics() {
  const mapUrl = useSyncExternalStore(subscribe, getDisplacementMap, () => null);

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
        x="-12%"
        y="-12%"
        width="124%"
        height="124%"
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
          result="bend"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={DISPLACE_SCALE + 6}
          xChannelSelector="R"
          yChannelSelector="G"
          result="bendR"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="map"
          scale={DISPLACE_SCALE - 5}
          xChannelSelector="R"
          yChannelSelector="G"
          result="bendB"
        />
        <feColorMatrix
          in="bendR"
          type="matrix"
          values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="red"
        />
        <feColorMatrix
          in="bend"
          type="matrix"
          values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
          result="green"
        />
        <feColorMatrix
          in="bendB"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
          result="blue"
        />
        <feBlend in="red" in2="green" mode="screen" result="rg" />
        <feBlend in="rg" in2="blue" mode="screen" />
      </filter>
    </svg>
  );
}
