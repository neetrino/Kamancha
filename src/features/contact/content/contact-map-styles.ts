import type { GoogleMapStyle } from "@/lib/maps/load-google-maps-script";

/**
 * Google Maps style — light green and white, tuned to Kamancha forest.
 * Applied via Maps JavaScript API `styles` (legacy styling).
 */
export const CONTACT_MAP_STYLES: GoogleMapStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#e8f0e0" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#3d5c3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c5d6b8" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b8568" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#dcecc6" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#d4e5c4" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5a7358" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#cfe5b8" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a6a4b" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#d4e0cc" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4a6a4b" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#c5d6b8" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d5c3e" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#dce8d4" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5a7358" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c5ddd0" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b8568" }],
  },
];
