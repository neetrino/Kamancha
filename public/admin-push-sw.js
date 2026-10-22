/* Admin new-order Web Push service worker (scope: /). */

const ADMIN_PATH_SEGMENT = "/admin";
const NOTIFICATION_ICON = "/favicon.ico";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function parsePayload(data) {
  if (!data) return null;
  try {
    const payload = data.json();
    if (!payload || typeof payload.title !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

async function hasVisibleWindow() {
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return windows.some((client) => client.visibilityState === "visible");
}

async function showPushNotification(payload) {
  const title = payload ? payload.title : "New order";
  const url = payload && typeof payload.url === "string" ? payload.url : "/";
  // userVisibleOnly requires a notification; stay silent when an open tab
  // already plays the looping in-page alert.
  const silent = await hasVisibleWindow();
  await self.registration.showNotification(title, {
    body: payload && typeof payload.body === "string" ? payload.body : "",
    tag: payload && typeof payload.tag === "string" ? payload.tag : undefined,
    icon: NOTIFICATION_ICON,
    requireInteraction: true,
    silent,
    data: { url },
  });
}

self.addEventListener("push", (event) => {
  event.waitUntil(showPushNotification(parsePayload(event.data)));
});

async function focusAdminWindow(url) {
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  const target = new URL(url, self.location.origin).href;
  const adminWindow = windows.find((client) =>
    new URL(client.url).pathname.includes(ADMIN_PATH_SEGMENT),
  );

  if (adminWindow) {
    const focused = (await adminWindow.focus()) || adminWindow;
    try {
      await focused.navigate(target);
    } catch {
      // Uncontrolled clients cannot be navigated; focusing is enough.
    }
    return;
  }
  await self.clients.openWindow(target);
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    event.notification.data && typeof event.notification.data.url === "string"
      ? event.notification.data.url
      : "/";
  event.waitUntil(focusAdminWindow(url));
});
