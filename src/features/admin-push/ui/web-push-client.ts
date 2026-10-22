const ADMIN_PUSH_SW_URL = "/admin-push-sw.js";
const ADMIN_PUSH_SW_SCOPE = "/";

export type BrowserPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type SubscribeToWebPushResult =
  | { status: "subscribed"; subscription: BrowserPushSubscription }
  | { status: "denied" }
  | { status: "dismissed" };

/** Whether this browser can receive Web Push (service worker + Push API + Notification). */
export function isWebPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index);
  }
  return bytes;
}

/** Plain endpoint + keys of a browser subscription for the server. */
export function serializePushSubscription(
  subscription: PushSubscription,
): BrowserPushSubscription {
  const json = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
  };
}

/** Existing push subscription of the admin service worker, if any. */
export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isWebPushSupported()) return null;
  const registration =
    await navigator.serviceWorker.getRegistration(ADMIN_PUSH_SW_SCOPE);
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

/**
 * Must run from a click handler: asks for notification permission, registers
 * the service worker and subscribes to push.
 */
export async function subscribeToWebPush(
  publicKey: string,
): Promise<SubscribeToWebPushResult> {
  const permission = await Notification.requestPermission();
  if (permission === "denied") return { status: "denied" };
  if (permission !== "granted") return { status: "dismissed" };

  await navigator.serviceWorker.register(ADMIN_PUSH_SW_URL, {
    scope: ADMIN_PUSH_SW_SCOPE,
  });
  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  return {
    status: "subscribed",
    subscription: serializePushSubscription(subscription),
  };
}
