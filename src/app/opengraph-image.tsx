import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const alt = "Kamancha";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRAND_FOREST = "#265127";
const WORDMARK_PATH = "public/assets/brand/hero/hero-wordmark.svg";

async function loadWordmarkDataUri(): Promise<string> {
  const data = await readFile(join(process.cwd(), WORDMARK_PATH));
  return `data:image/svg+xml;base64,${data.toString("base64")}`;
}

/** Social / messenger link preview — forest green with centered wordmark. */
export default async function OpenGraphImage() {
  const wordmarkSrc = await loadWordmarkDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: BRAND_FOREST,
        }}
      >
        {/* ImageResponse requires <img> — not next/image. */}
        <img src={wordmarkSrc} alt="" width={520} height={250} />
      </div>
    ),
    { ...size },
  );
}
