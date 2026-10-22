import { logger } from "@/lib/observability/logger";

/**
 * Dedicated workers are exempt from the timer throttling browsers apply to
 * hidden tabs, so polling and the alert chime keep their cadence in background.
 */
const TICKER_WORKER_SOURCE = `
let timer = null;
self.onmessage = (event) => {
  clearInterval(timer);
  timer = null;
  if (event.data && event.data.type === "start") {
    timer = setInterval(() => self.postMessage(0), event.data.ms);
  }
};
`;

let tickerWorkerUrl: string | null = null;

function createTickerWorker(): Worker | null {
  if (typeof Worker === "undefined") return null;
  try {
    tickerWorkerUrl ??= URL.createObjectURL(
      new Blob([TICKER_WORKER_SOURCE], { type: "text/javascript" }),
    );
    return new Worker(tickerWorkerUrl);
  } catch (error) {
    logger.warn("admin_order_alert_ticker_worker_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Runs `callback` every `ms` without background-tab throttling.
 * Falls back to `window.setInterval` when workers are unavailable.
 * @returns stop function
 */
export function startBackgroundInterval(
  callback: () => void,
  ms: number,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const worker = createTickerWorker();
  if (!worker) {
    const timer = window.setInterval(callback, ms);
    return () => window.clearInterval(timer);
  }

  worker.onmessage = () => callback();
  worker.postMessage({ type: "start", ms });
  return () => worker.terminate();
}
