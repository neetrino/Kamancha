const STATIC_ASSET_PREFIX = "/assets/";

type StaticAssetUrlOptions = {
  /**
   * Keep the `/assets/...` origin for CSS masks and other fetches that need CORS
   * from the app host. Cross-origin CDN SVGs fail silently as `mask-image` sources.
   */
  sameOrigin?: boolean;
};

/**
 * Resolves a `/assets/...` path to the R2 CDN URL when configured.
 * Falls back to the local `public/` path when no CDN base is set.
 */
export function staticAssetUrl(
  path: string,
  options?: StaticAssetUrlOptions,
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (options?.sameOrigin || !normalized.startsWith(STATIC_ASSET_PREFIX)) {
    return normalized;
  }

  const base = process.env.NEXT_PUBLIC_STATIC_ASSET_BASE_URL?.replace(/\/$/, "");
  if (!base) {
    return normalized;
  }

  return `${base}${normalized}`;
}

/** CSS `background-image` value for a static brand asset. */
export function staticAssetBackground(path: string): string {
  return `url(${staticAssetUrl(path)})`;
}
