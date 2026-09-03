"use client";

import { useEffect, useRef, useState } from "react";

import { getContactMapConfigAction } from "@/features/contact/application/get-contact-map-config";
import { CONTACT_MAP_STYLES } from "@/features/contact/content/contact-map-styles";
import { KAMANCHA_BRANCHES } from "@/lib/brand/store-locations";
import {
  loadGoogleMapsScript,
  type GoogleMapInstance,
  type GoogleMapsNamespace,
} from "@/lib/maps/load-google-maps-script";
import { staticAssetUrl } from "@/lib/media/static-asset-url";
import { logger } from "@/lib/observability/logger";

/** Same-origin so Maps can load the pin without CDN CORS issues. */
const MAP_PIN_SRC = staticAssetUrl("/assets/brand/contact/map-pin.svg", {
  sameOrigin: true,
});
const MAP_PIN_WIDTH = 44;
const MAP_PIN_HEIGHT = 56;

type ContactMapProps = {
  title: string;
  tumanyanLabel: string;
  saryanLabel: string;
  unavailableLabel: string;
};

/**
 * Contact map — both Kamancha branches, light green / white styled Google Map.
 * Parent sets width to match the contact pills row.
 */
export function ContactMap({
  title,
  tumanyanLabel,
  saryanLabel,
  unavailableLabel,
}: ContactMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const mapsApiRef = useRef<GoogleMapsNamespace | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const cancelled = { current: false };

    void (async () => {
      const config = await getContactMapConfigAction({
        tumanyan: tumanyanLabel,
        saryan: saryanLabel,
      });
      if (cancelled.current) return;

      if (!config.ok) {
        setFailed(true);
        return;
      }

      try {
        const maps = await loadGoogleMapsScript(config.apiKey);
        if (cancelled.current || !mapElementRef.current) return;

        mapsApiRef.current = maps;
        const map = new maps.Map(mapElementRef.current, {
          center: {
            lat: KAMANCHA_BRANCHES.tumanyan.lat,
            lng: KAMANCHA_BRANCHES.tumanyan.lng,
          },
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
          clickableIcons: false,
          styles: CONTACT_MAP_STYLES,
        });
        mapRef.current = map;

        const bounds = new maps.LatLngBounds();
        const markerIcon = {
          url: MAP_PIN_SRC,
          scaledSize: new maps.Size(MAP_PIN_WIDTH, MAP_PIN_HEIGHT),
          anchor: new maps.Point(MAP_PIN_WIDTH / 2, MAP_PIN_HEIGHT),
        };

        for (const branch of config.branches) {
          const position = { lat: branch.lat, lng: branch.lng };
          new maps.Marker({
            map,
            position,
            title: branch.label,
            icon: markerIcon,
          });
          bounds.extend(position);
        }
        map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
        if (!cancelled.current) {
          setReady(true);
        }
      } catch (error) {
        logger.warn("contact.map_init_failed", {
          message: error instanceof Error ? error.message : "unknown",
        });
        if (!cancelled.current) {
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled.current = true;
      mapRef.current = null;
      mapsApiRef.current = null;
    };
  }, [tumanyanLabel, saryanLabel]);

  useEffect(() => {
    const node = mapElementRef.current;
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!ready || !node || !map || !maps) {
      return;
    }

    const observer = new ResizeObserver(() => {
      maps.event.trigger(map, "resize");
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready]);

  return (
    <section aria-label={title} className="relative z-[1] w-full">
      <div className="relative w-full overflow-hidden rounded-[24px] border border-brand-forest/10 bg-[#e8f0e0] sm:rounded-[30px] xl:rounded-[40px]">
        {failed ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-6 py-16 text-center sm:min-h-[360px]">
            <p className="max-w-md text-[15px] leading-6 text-brand-forest/70">
              {unavailableLabel}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={KAMANCHA_BRANCHES.tumanyan.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-brand-forest px-5 py-2.5 font-big-fat-boii text-[13px] text-white uppercase transition-opacity hover:opacity-90"
              >
                {tumanyanLabel}
              </a>
              <a
                href={KAMANCHA_BRANCHES.saryan.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-brand-forest px-5 py-2.5 font-big-fat-boii text-[13px] text-white uppercase transition-opacity hover:opacity-90"
              >
                {saryanLabel}
              </a>
            </div>
          </div>
        ) : (
          <div
            ref={mapElementRef}
            className="h-[280px] w-full sm:h-[360px] xl:h-[420px]"
          />
        )}
      </div>
    </section>
  );
}
