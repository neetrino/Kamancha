"use server";

import { getEnv } from "@/config/env";
import { KAMANCHA_BRANCHES } from "@/lib/brand/store-locations";

export type ContactMapBranch = {
  id: string;
  lat: number;
  lng: number;
  mapUrl: string;
  label: string;
};

export type ContactMapConfigResult =
  | {
      ok: true;
      apiKey: string;
      branches: ContactMapBranch[];
    }
  | { ok: false; error: string };

type ContactMapLabels = {
  tumanyan: string;
  saryan: string;
};

/**
 * Browser Maps JS config for the contact page location map.
 */
export async function getContactMapConfigAction(
  labels: ContactMapLabels,
): Promise<ContactMapConfigResult> {
  const apiKey = getEnv().GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error: "Google Maps is not configured.",
    };
  }

  return {
    ok: true,
    apiKey,
    branches: [
      {
        id: KAMANCHA_BRANCHES.tumanyan.id,
        lat: KAMANCHA_BRANCHES.tumanyan.lat,
        lng: KAMANCHA_BRANCHES.tumanyan.lng,
        mapUrl: KAMANCHA_BRANCHES.tumanyan.mapUrl,
        label: labels.tumanyan,
      },
      {
        id: KAMANCHA_BRANCHES.saryan.id,
        lat: KAMANCHA_BRANCHES.saryan.lat,
        lng: KAMANCHA_BRANCHES.saryan.lng,
        mapUrl: KAMANCHA_BRANCHES.saryan.mapUrl,
        label: labels.saryan,
      },
    ],
  };
}
