"use client";

import { useCallback, useLayoutEffect, useSyncExternalStore } from "react";

type Listener = () => void;

let cartItemCount = 0;
let wishlistCount = 0;

/** In-flight optimistic updates — ignore stale server hydrates meanwhile. */
let cartInFlight = 0;
let wishlistInFlight = 0;

const cartListeners = new Set<Listener>();
const wishlistListeners = new Set<Listener>();

function emit(listeners: Set<Listener>): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribeCart(listener: Listener): () => void {
  cartListeners.add(listener);
  return () => {
    cartListeners.delete(listener);
  };
}

function subscribeWishlist(listener: Listener): () => void {
  wishlistListeners.add(listener);
  return () => {
    wishlistListeners.delete(listener);
  };
}

function getCartSnapshot(): number {
  return cartItemCount;
}

function getWishlistSnapshot(): number {
  return wishlistCount;
}

export function setCartItemCount(next: number): void {
  const value = Math.max(0, next);
  if (value === cartItemCount) return;
  cartItemCount = value;
  emit(cartListeners);
}

export function adjustCartItemCount(delta: number): void {
  cartInFlight += 1;
  setCartItemCount(cartItemCount + delta);
}

/** Undo an optimistic cart bump and clear its in-flight mark. */
export function revertCartItemCountAdjust(delta: number): void {
  setCartItemCount(cartItemCount + delta);
  settleCartItemCountAdjust();
}

/** Call after add-to-cart server action succeeds. */
export function settleCartItemCountAdjust(): void {
  cartInFlight = Math.max(0, cartInFlight - 1);
}

export function setWishlistCount(next: number): void {
  const value = Math.max(0, next);
  if (value === wishlistCount) return;
  wishlistCount = value;
  emit(wishlistListeners);
}

export function adjustWishlistCount(delta: number): void {
  wishlistInFlight += 1;
  setWishlistCount(wishlistCount + delta);
}

/** Undo an optimistic wishlist bump and clear its in-flight mark. */
export function revertWishlistCountAdjust(delta: number): void {
  setWishlistCount(wishlistCount + delta);
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
  const getServerSnapshot = useCallback(() => serverCount, [serverCount]);
  const count = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerSnapshot,
  );

  useLayoutEffect(() => {
    if (cartInFlight > 0) return;
    setCartItemCount(serverCount);
  }, [serverCount]);

  return count;
}

/**
 * Wishlist badge count — hydrated from server, then updated locally on like.
 */
export function useWishlistCount(serverCount: number): number {
  const getServerSnapshot = useCallback(() => serverCount, [serverCount]);
  const count = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getServerSnapshot,
  );

  useLayoutEffect(() => {
    if (wishlistInFlight > 0) return;
    setWishlistCount(serverCount);
  }, [serverCount]);

  return count;
}
