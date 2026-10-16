import Image from "next/image";

import { staticAssetUrl } from "@/lib/media/static-asset-url";

const HUB = "/assets/brand/hub";
const SAME_ORIGIN = { sameOrigin: true } as const;

/**
 * Restormania mark (Figma 704:4063) — white stamps + lettering, no plate fill.
 */
export function RestormaniaHubMark({ className = "top-[15px] left-[19px]" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute z-[1] h-[112px] w-[145px] ${className}`}
      data-node-id="704:4063"
    >
      <Image
        src={staticAssetUrl(`${HUB}/restormania-stamp-at.svg`, SAME_ORIGIN)}
        alt=""
        width={37}
        height={45}
        unoptimized
        className="absolute max-w-none"
        style={{ left: -0.03, top: 7 }}
        data-node-id="704:4066"
      />
      <Image
        src={staticAssetUrl(`${HUB}/restormania-stamp-restor.svg`, SAME_ORIGIN)}
        alt=""
        width={103}
        height={44}
        unoptimized
        className="absolute max-w-none"
        style={{ left: 12.63, top: 38.86 }}
        data-node-id="704:4065"
      />
      <Image
        src={staticAssetUrl(`${HUB}/restormania-stamp-mania.svg`, SAME_ORIGIN)}
        alt=""
        width={86}
        height={31}
        unoptimized
        className="absolute max-w-none"
        style={{ left: 52.8, top: 75.26 }}
        data-node-id="704:4064"
      />
      <Image
        src={staticAssetUrl(`${HUB}/restormania-lettering.svg`, SAME_ORIGIN)}
        alt=""
        width={126}
        height={82}
        unoptimized
        className="absolute max-w-none"
        style={{ left: 5.92, top: 20.41 }}
        data-node-id="704:4070"
      />
    </div>
  );
}
