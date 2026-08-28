/**
 * Kamancha branch locations — map links open the restaurant pin, not a bare street.
 * Coordinates from 2GIS firm listings (Tumanyan 23 / Saryan 8).
 */

type StoreBranch = {
  id: "tumanyan" | "saryan";
  /** WGS84 latitude. */
  lat: number;
  /** WGS84 longitude. */
  lng: number;
  /** Google Maps search that prefers the Kamancha listing near the pin. */
  mapUrl: string;
};

function kamanchaMapUrl(lat: number, lng: number, query: string): string {
  const params = new URLSearchParams({
    api: "1",
    query: `${query}@${lat},${lng}`,
  });
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

export const KAMANCHA_BRANCHES = {
  tumanyan: {
    id: "tumanyan",
    lat: 40.184219,
    lng: 44.514177,
    mapUrl: kamanchaMapUrl(
      40.184219,
      44.514177,
      "Kamancha, 23 Tumanyan Street, Yerevan",
    ),
  },
  saryan: {
    id: "saryan",
    lat: 40.186835,
    lng: 44.508542,
    mapUrl: kamanchaMapUrl(
      40.186835,
      44.508542,
      "Kamancha, 8 Saryan Street, Yerevan",
    ),
  },
} as const satisfies Record<string, StoreBranch>;
