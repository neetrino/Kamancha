let lastPathname = "";
let pendingDeliveryNavbarDrop = false;

export function peekStorefrontPathname(): string {
  return lastPathname;
}

export function commitStorefrontPathname(pathname: string): void {
  lastPathname = pathname;
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
