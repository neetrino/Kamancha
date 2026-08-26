import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { staticAssetUrl } from "@/lib/media/static-asset-url";

/**
 * Loads bytes for a static asset from R2 (when configured) or `public/`.
 */
export async function loadStaticAssetBytes(assetPath: string): Promise<Buffer> {
  const normalized = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  const url = staticAssetUrl(normalized);

  if (url.startsWith("http://") || url.startsWith("https://")) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch static asset: ${url} (${response.status})`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  const localPath = join(process.cwd(), "public", normalized.slice(1));
  return readFile(localPath);
}
