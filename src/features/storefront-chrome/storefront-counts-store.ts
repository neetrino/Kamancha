"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

type StorefrontCounts = {
  cartItemCount: number;
  wishlistCount: number;
};

type Listener = () => void;

let counts: StorefrontCounts = {
  cartItemCount: 0,
  wishlistCount: 0,
};

/** In-flight optimistic updates — ignore stale server hydrates meanwhile. */
let cartInFlight = 0;
let wishlistInFlight = 0;

const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): StorefrontCounts {
  return counts;
}

function setCounts(partial: Partial<StorefrontCounts>): void {
  const nextCart = partial.cartItemCount ?? counts.cartItemCount;
  const nextWishlist = partial.wishlistCount ?? counts.wishlistCount;
  if (
    nextCart === counts.cartItemCount &&
    nextWishlist === counts.wishlistCount
  ) {
    return;
  }
  counts = {
    cartItemCount: Math.max(0, nextCart),
    wishlistCount: Math.max(0, nextWishlist),
  };
  emit();
}

export function setCartItemCount(cartItemCount: number): void {
  setCounts({ cartItemCount });
}

export function adjustCartItemCount(delta: number): void {
  cartInFlight += 1;
  setCounts({ cartItemCount: counts.cartItemCount + delta });
}

/** Undo an optimistic cart bump and clear its in-flight mark. */
export function revertCartItemCountAdjust(delta: number): void {
  setCounts({ cartItemCount: counts.cartItemCount + delta });
  settleCartItemCountAdjust();
}

/** Call after add-to-cart server action succeeds. */
export function settleCartItemCountAdjust(): void {
  cartInFlight = Math.max(0, cartInFlight - 1);
}

export function setWishlistCount(wishlistCount: number): void {
  setCounts({ wishlistCount });
}

export function adjustWishlistCount(delta: number): void {
  wishlistInFlight += 1;
  setCounts({ wishlistCount: counts.wishlistCount + delta });
}

/** Undo an optimistic wishlist bump and clear its in-flight mark. */
export function revertWishlistCountAdjust(delta: number): void {
  setCounts({ wishlistCount: counts.wishlistCount + delta });
  settleWishlistCountAdjust();
}

/** Call after wishlist toggle succeeds. */
export function settleWishlistCountAdjust(): void {
  wishlistInFlight = Math.max(0, wishlistInFlight - 1);
}

/**
 * Cart badge count — hydrated from server, then updated locally on add/remove.
 */
export function useCartItemCount(serverCount: number): number {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => ({ cartItemCount: serverCount, wishlistCount: 0 }),
  );

  useLayoutEffect(() => {
    if (cartInFlight > 0) return;
    setCartItemCount(serverCount);
  }, [serverCount]);

  return snapshot.cartItemCount;
}

/**
 * Wishlist badge count — hydrated from server, then updated locally on like.
 */
export function useWishlistCount(serverCount: number): number {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => ({ cartItemCount: 0, wishlistCount: serverCount }),
  );

  useLayoutEffect(() => {
    if (wishlistInFlight > 0) return;
    setWishlistCount(serverCount);
  }, [serverCount]);

  return snapshot.wishlistCount;
}
