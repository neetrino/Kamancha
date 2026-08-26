const STATIC_ASSET_PREFIX = "/assets/";

/**
 * Resolves a `/assets/...` path to the R2 CDN URL when configured.
 * Falls back to the local `public/` path when no CDN base is set.
 */
export function staticAssetUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = process.env.NEXT_PUBLIC_STATIC_ASSET_BASE_URL?.replace(/\/$/, "");

  if (!base || !normalized.startsWith(STATIC_ASSET_PREFIX)) {
    return normalized;
  }

  return `${base}${normalized}`;
}

/** CSS `background-image` value for a static brand asset. */
export function staticAssetBackground(path: string): string {
  return `url(${staticAssetUrl(path)})`;
}
