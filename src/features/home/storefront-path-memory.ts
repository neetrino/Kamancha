let lastPathname = "";
let pendingDeliveryNavbarDrop = false;
let hubReturnSkipArms: boolean | null = null;

export function peekStorefrontPathname(): string {
  return lastPathname;
}

export function commitStorefrontPathname(pathname: string): void {
  lastPathname = pathname;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length !== 1) {
    hubReturnSkipArms = null;
  }
}

export function captureHubReturnSkipArms(
  isReturnVisit: boolean,
  onHub: boolean,
): boolean {
  if (!onHub) {
    hubReturnSkipArms = null;
    return false;
  }
  if (hubReturnSkipArms === null) {
    hubReturnSkipArms = isReturnVisit;
  }
  return hubReturnSkipArms;
}

export function armPendingDeliveryNavbarDrop(): void {
  pendingDeliveryNavbarDrop = true;
}

export function isPendingDeliveryNavbarDrop(): boolean {
  return pendingDeliveryNavbarDrop;
}

export function consumePendingDeliveryNavbarDrop(): boolean {
  const pending = pendingDeliveryNavbarDrop;
  pendingDeliveryNavbarDrop = false;
  return pending;
}
