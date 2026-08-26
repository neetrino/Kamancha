import sharp from "sharp";

import { loadStaticAssetBytes } from "@/lib/media/load-static-asset";

export const alt = "Kamancha";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
/** Sharp needs Node — not Edge. */
export const runtime = "nodejs";

const BRAND_FOREST = { r: 0x26, g: 0x51, b: 0x27 };
const WORDMARK_PATH = "/assets/brand/hero/hero-wordmark.svg";
const WORDMARK_WIDTH = 560;

/**
 * Link-preview image — forest green with centered wordmark.
 * Rasterized with sharp: Satori/ImageResponse does not reliably paint this SVG.
 */
export default async function OpenGraphImage(): Promise<Response> {
  const wordmarkSvg = await loadStaticAssetBytes(WORDMARK_PATH);
  const wordmarkPng = await sharp(wordmarkSvg)
    .resize({ width: WORDMARK_WIDTH, withoutEnlargement: true })
    .png()
    .toBuffer();

  const png = await sharp({
    create: {
      width: size.width,
      height: size.height,
      channels: 3,
      background: BRAND_FOREST,
    },
  })
    .composite([{ input: wordmarkPng, gravity: "center" }])
    .png()
    .toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
