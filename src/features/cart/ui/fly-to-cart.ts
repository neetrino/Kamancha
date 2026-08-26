import { staticAssetUrl } from "@/lib/media/static-asset-url";

const CART_FLY_TARGET = "[data-cart-fly-target]";
const CART_ICON_SRC = staticAssetUrl("/assets/brand/cart-icon.svg");
const FLY_MS = 650;

function pickVisibleCartTarget(): HTMLElement | null {
  const targets = document.querySelectorAll<HTMLElement>(CART_FLY_TARGET);
  let best: HTMLElement | null = null;
  let bestArea = 0;

  for (const el of targets) {
    const rect = el.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area <= 0) continue;
    if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
    if (area > bestArea) {
      best = el;
      bestArea = area;
    }
  }

  return best;
}

/**
 * Animates a small cart glyph from `fromEl` to the header/bottom-nav cart icon.
 */
export function flyToCart(fromEl: HTMLElement): void {
  if (typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target = pickVisibleCartTarget();
  if (!target) return;

  const from = fromEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = 24;
  const startX = from.left + from.width / 2 - size / 2;
  const startY = from.top + from.height / 2 - size / 2;
  const endX = to.left + to.width / 2 - size / 2;
  const endY = to.top + to.height / 2 - size / 2;

  const flyer = document.createElement("div");
  flyer.setAttribute("aria-hidden", "true");
  flyer.style.cssText = [
    "position:fixed",
    `left:${startX}px`,
    `top:${startY}px`,
    `width:${size}px`,
    `height:${size}px`,
    "z-index:9999",
    "pointer-events:none",
    "border-radius:9999px",
    "background:rgba(255,255,255,0.95)",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "box-shadow:0 6px 18px rgba(0,0,0,0.22)",
    "will-change:transform,opacity",
  ].join(";");

  const img = document.createElement("img");
  img.src = CART_ICON_SRC;
  img.alt = "";
  img.width = 14;
  img.height = 14;
  img.style.filter = "invert(1) brightness(0)";
  flyer.appendChild(img);
  document.body.appendChild(flyer);

  const dx = endX - startX;
  const dy = endY - startY;

  requestAnimationFrame(() => {
    flyer.style.transition = `transform ${FLY_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${FLY_MS}ms ease-out`;
    flyer.style.transform = `translate(${dx}px, ${dy}px) scale(0.4)`;
    flyer.style.opacity = "0.25";
  });

  target.classList.add("cart-fly-pulse");
  window.setTimeout(() => {
    target.classList.remove("cart-fly-pulse");
  }, FLY_MS + 80);

  window.setTimeout(() => {
    flyer.remove();
  }, FLY_MS + 40);
}
