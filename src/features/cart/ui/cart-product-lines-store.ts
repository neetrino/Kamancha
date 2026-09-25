"use client";

import { useCallback, useSyncExternalStore } from "react";

import type {
  PlainCartLine,
  PlainCartLineResult,
} from "@/features/cart/domain/plain-line";
import { setStorefrontPlainLineQuantity } from "@/features/cart/storefront-cart-mutations";
import { showStorefrontAlert } from "@/features/storefront-chrome/storefront-alert-store";
import {
  adjustCartItemCount,
  settleCartItemCountAdjust,
} from "@/features/storefront-chrome/storefront-counts-store";

type Line = { itemId: string; quantity: number };
type Waiter = { target: number; resolve: (ok: boolean) => void };
type Listener = () => void;

const lines = new Map<string, Line>();
const committed = new Map<string, Line>();
const listeners = new Set<Listener>();
const commitListeners = new Set<Listener>();
const desired = new Map<string, number>();
const unsettled = new Map<string, number>();
const pumping = new Set<string>();
const waiters = new Map<string, Waiter[]>();

function emit(group: Set<Listener>): void {
  for (const listener of group) listener();
}

export function subscribeCartProductLines(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Fires after a plain-line write is confirmed, so an open cart can reload prices. */
export function subscribeCartLinesCommitted(listener: Listener): () => void {
  commitListeners.add(listener);
  return () => {
    commitListeners.delete(listener);
  };
}

export function getCartProductQuantity(productId: string): number {
  return lines.get(productId)?.quantity ?? 0;
}

function writeLine(productId: string, quantity: number, itemId: string): void {
  if (quantity < 1) {
    if (!lines.has(productId)) return;
    lines.delete(productId);
    emit(listeners);
    return;
  }
  const current = lines.get(productId);
  if (current?.quantity === quantity && current.itemId === itemId) return;
  lines.set(productId, { itemId, quantity });
  emit(listeners);
}

/** Replaces plain-line quantities from the server, leaving in-flight edits alone. */
export function hydrateCartProductLines(next: readonly PlainCartLine[]): void {
  const incoming = new Map(next.map((line) => [line.productId, line]));
  let changed = false;

  for (const [productId, line] of incoming) {
    if (pumping.has(productId)) continue;
    committed.set(productId, { itemId: line.itemId, quantity: line.quantity });
    const current = lines.get(productId);
    if (
      current?.quantity !== line.quantity ||
      current.itemId !== line.itemId
    ) {
      lines.set(productId, { itemId: line.itemId, quantity: line.quantity });
      changed = true;
    }
  }

  for (const productId of [...lines.keys()]) {
    if (pumping.has(productId) || incoming.has(productId)) continue;
    lines.delete(productId);
    committed.delete(productId);
    changed = true;
  }

  for (const productId of [...committed.keys()]) {
    if (pumping.has(productId) || incoming.has(productId)) continue;
    committed.delete(productId);
  }

  if (changed) emit(listeners);
}

function takeUnsettled(productId: string): number {
  const marks = unsettled.get(productId) ?? 0;
  unsettled.set(productId, 0);
  return marks;
}

function settleMarks(marks: number): void {
  for (let index = 0; index < marks; index += 1) {
    settleCartItemCountAdjust();
  }
}

function resolveWaiters(productId: string, target: number, ok: boolean): void {
  const pending = waiters.get(productId);
  if (!pending) return;
  const rest: Waiter[] = [];
  for (const waiter of pending) {
    if (waiter.target === target) waiter.resolve(ok);
    else rest.push(waiter);
  }
  if (rest.length === 0) waiters.delete(productId);
  else waiters.set(productId, rest);
}

function rememberCommitted(
  productId: string,
  result: Extract<PlainCartLineResult, { ok: true }>,
): void {
  if (result.quantity < 1 || result.itemId == null) {
    committed.delete(productId);
    return;
  }
  committed.set(productId, {
    itemId: result.itemId,
    quantity: result.quantity,
  });
}

function revertProductQuantity(productId: string): void {
  const saved = committed.get(productId) ?? null;
  const committedQty = saved?.quantity ?? 0;
  const uiQty = getCartProductQuantity(productId);
  if (committedQty !== uiQty) {
    adjustCartItemCount(committedQty - uiQty);
    settleCartItemCountAdjust();
  }
  if (!saved || committedQty < 1) {
    committed.delete(productId);
    writeLine(productId, 0, "");
    return;
  }
  writeLine(productId, saved.quantity, saved.itemId);
}

function applyConfirmedLine(
  productId: string,
  result: Extract<PlainCartLineResult, { ok: true }>,
): void {
  const uiQty = getCartProductQuantity(productId);
  if (result.quantity !== uiQty) {
    adjustCartItemCount(result.quantity - uiQty);
    settleCartItemCountAdjust();
  }
  writeLine(productId, result.quantity, result.itemId ?? "");
}

async function requestQuantity(
  productId: string,
  target: number,
): Promise<PlainCartLineResult> {
  try {
    return await setStorefrontPlainLineQuantity(productId, target);
  } catch (error) {
    const message =
      error instanceof Error && error.message.length > 0
        ? error.message
        : "Unable to update cart.";
    return { ok: false, error: message };
  }
}

async function pump(productId: string): Promise<void> {
  try {
    while (desired.has(productId)) {
      await runDesiredQuantity(productId);
    }
  } finally {
    pumping.delete(productId);
    if (desired.has(productId)) {
      pumping.add(productId);
      void pump(productId);
    }
  }
}

async function runDesiredQuantity(productId: string): Promise<void> {
  const target = desired.get(productId) ?? 0;
  desired.delete(productId);
  const marks = takeUnsettled(productId);
  const result = await requestQuantity(productId, target);
  const superseded = desired.has(productId);

  if (!result.ok && !superseded) {
    revertProductQuantity(productId);
    showStorefrontAlert(result.error);
    settleMarks(marks);
    resolveWaiters(productId, target, false);
    return;
  }

  if (result.ok) {
    rememberCommitted(productId, result);
    if (!superseded) {
      applyConfirmedLine(productId, result);
      emit(commitListeners);
    }
  }

  settleMarks(marks);
  resolveWaiters(productId, target, true);
}

function enqueue(productId: string, target: number): Promise<boolean> {
  const promise = new Promise<boolean>((resolve) => {
    const list = waiters.get(productId) ?? [];
    list.push({ target, resolve });
    waiters.set(productId, list);
  });
  if (!pumping.has(productId)) {
    pumping.add(productId);
    void pump(productId);
  }
  return promise;
}

/**
 * Optimistic absolute quantity for a product card.
 * `0` removes the plain cart line. Later clicks coalesce into one request.
 */
export function syncCartProductQuantity(
  productId: string,
  nextQuantity: number,
): Promise<boolean> {
  const next = Math.max(0, Math.floor(nextQuantity));
  const current = getCartProductQuantity(productId);
  if (next !== current) {
    const itemId =
      lines.get(productId)?.itemId ?? committed.get(productId)?.itemId ?? "";
    writeLine(productId, next, itemId);
    adjustCartItemCount(next - current);
    unsettled.set(productId, (unsettled.get(productId) ?? 0) + 1);
  }
  desired.set(productId, next);
  return enqueue(productId, next);
}

/** Live plain-line quantity for one product. `0` when it is not in the bag. */
export function useCartProductQuantity(productId: string): number {
  const subscribe = useCallback(
    (listener: Listener) => subscribeCartProductLines(listener),
    [],
  );
  const getSnapshot = useCallback(
    () => getCartProductQuantity(productId),
    [productId],
  );
  const getServerSnapshot = useCallback(() => 0, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
