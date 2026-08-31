"use client";

type Listener = () => void;

export type StorefrontAlertState = {
  message: string;
  token: number;
};

let state: StorefrontAlertState | null = null;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** Shows a top-of-viewport warning (spend-limit, bag errors, etc.). */
export function showStorefrontAlert(message: string): void {
  const trimmed = message.trim();
  if (trimmed.length === 0) return;
  state = { message: trimmed, token: Date.now() };
  emit();
}

export function clearStorefrontAlert(): void {
  if (state == null) return;
  state = null;
  emit();
}

export function subscribeStorefrontAlert(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStorefrontAlertSnapshot(): StorefrontAlertState | null {
  return state;
}
