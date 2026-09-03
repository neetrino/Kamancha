"use client";

type GoogleLatLngLiteral = { lat: number; lng: number };

type GoogleMapStyle = {
  featureType?: string;
  elementType?: string;
  stylers: Array<Record<string, string | number | boolean>>;
};

type GoogleMapOptions = {
  center: GoogleLatLngLiteral;
  zoom: number;
  mapTypeControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
  zoomControl?: boolean;
  clickableIcons?: boolean;
  disableDefaultUI?: boolean;
  gestureHandling?: "auto" | "cooperative" | "greedy" | "none";
  styles?: GoogleMapStyle[];
};

type GoogleLatLngBounds = {
  extend: (point: GoogleLatLngLiteral) => void;
};

type GoogleMapsNamespace = {
  Map: new (element: HTMLElement, options: GoogleMapOptions) => GoogleMapInstance;
  Marker: new (options: {
    map: GoogleMapInstance;
    position: GoogleLatLngLiteral;
    draggable?: boolean;
    title?: string;
    icon?:
      | string
      | {
          url: string;
          scaledSize?: GoogleSize;
          size?: GoogleSize;
          anchor?: GooglePoint;
        };
  }) => GoogleMarkerInstance;
  LatLngBounds: new () => GoogleLatLngBounds;
  Size: new (width: number, height: number) => GoogleSize;
  Point: new (x: number, y: number) => GooglePoint;
  event: {
    addListener: (
      instance: GoogleMapInstance | GoogleMarkerInstance,
      eventName: string,
      handler: (event: {
        latLng?: { lat: () => number; lng: () => number } | null;
      }) => void,
    ) => void;
    trigger: (instance: GoogleMapInstance, eventName: string) => void;
  };
};

type GoogleSize = {
  width: number;
  height: number;
};

type GooglePoint = {
  x: number;
  y: number;
};

type GoogleMapInstance = {
  setCenter: (position: GoogleLatLngLiteral) => void;
  setZoom: (zoom: number) => void;
  fitBounds: (
    bounds: GoogleLatLngBounds,
    padding?: number | { top: number; right: number; bottom: number; left: number },
  ) => void;
};

type GoogleMarkerInstance = {
  setPosition: (position: GoogleLatLngLiteral) => void;
  getPosition: () => { lat: () => number; lng: () => number } | null;
};

declare global {
  interface Window {
    google?: { maps?: GoogleMapsNamespace };
    __kamanchaMapsReady?: () => void;
  }
}

const SCRIPT_ID = "kamancha-google-maps-js";

/** Loads Google Maps JavaScript API once per page. */
export function loadGoogleMapsScript(apiKey: string): Promise<GoogleMapsNamespace> {
  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const timer = window.setInterval(() => {
        if (window.google?.maps) {
          window.clearInterval(timer);
          resolve(window.google.maps);
          return;
        }
        if (Date.now() - started > 15000) {
          window.clearInterval(timer);
          reject(new Error("Google Maps failed to load."));
        }
      }, 50);
    });
  }

  return new Promise((resolve, reject) => {
    window.__kamanchaMapsReady = () => {
      if (window.google?.maps) {
        resolve(window.google.maps);
        return;
      }
      reject(new Error("Google Maps failed to initialize."));
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=__kamanchaMapsReady`;
    script.onerror = () => {
      reject(
        new Error(
          "Google Maps failed to load. Check that Maps JavaScript API is enabled and allowed by Content-Security-Policy.",
        ),
      );
    };
    document.head.appendChild(script);
  });
}

export type {
  GoogleMapsNamespace,
  GoogleMapInstance,
  GoogleMarkerInstance,
  GoogleMapStyle,
  GoogleLatLngLiteral,
};
