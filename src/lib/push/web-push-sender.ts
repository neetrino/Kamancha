import "server-only";

import { sendNotification, WebPushError } from "web-push";

import { getEnv } from "@/config/env";

/** Push service drops undelivered alerts after this long (seconds). */
const WEB_PUSH_TTL_SECONDS = 60 * 60;

export type WebPushTarget = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type WebPushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
};

type VapidConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

function resolveVapidSubject(): string | null {
  const { VAPID_SUBJECT, NEXT_PUBLIC_APP_URL } = getEnv();
  if (VAPID_SUBJECT) return VAPID_SUBJECT;
  return NEXT_PUBLIC_APP_URL.startsWith("https://") ? NEXT_PUBLIC_APP_URL : null;
}

function getVapidConfig(): VapidConfig | null {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = getEnv();
  const subject = resolveVapidSubject();
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !subject) return null;
  return {
    publicKey: VAPID_PUBLIC_KEY,
    privateKey: VAPID_PRIVATE_KEY,
    subject,
  };
}

/** VAPID public key for browser subscribe, or null when push is not configured. */
export function getWebPushPublicKey(): string | null {
  return getVapidConfig()?.publicKey ?? null;
}

/**
 * Sends one push message.
 * @returns `expired` when the push service reports the subscription gone (404/410)
 * @throws on missing config or any other delivery error
 */
export async function sendWebPush(
  target: WebPushTarget,
  payload: WebPushPayload,
): Promise<"sent" | "expired"> {
  const config = getVapidConfig();
  if (!config) {
    throw new Error("Web Push is not configured");
  }

  try {
    await sendNotification(
      {
        endpoint: target.endpoint,
        keys: { p256dh: target.p256dh, auth: target.auth },
      },
      JSON.stringify(payload),
      {
        TTL: WEB_PUSH_TTL_SECONDS,
        urgency: "high",
        vapidDetails: config,
      },
    );
    return "sent";
  } catch (error) {
    if (
      error instanceof WebPushError &&
      (error.statusCode === 404 || error.statusCode === 410)
    ) {
      return "expired";
    }
    throw error;
  }
}
