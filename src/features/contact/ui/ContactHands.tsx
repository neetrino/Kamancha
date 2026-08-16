import Image from "next/image";

import {
  CONTACT_HAND_PARCHMENT_SRC,
  CONTACT_HAND_QUILL_SRC,
} from "@/lib/brand/assets";

/**
 * Flanking parchment and quill hands — Figma 244:509 / 251:510.
 */
export function ContactHands() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 top-8 z-0 hidden h-[720px] overflow-visible sm:top-10 lg:block"
        aria-hidden
      >
        <Image
          src={CONTACT_HAND_PARCHMENT_SRC}
          alt=""
          width={540}
          height={719}
          className="absolute -top-26 left-0 h-auto w-[min(42vw,560px)] max-w-none object-contain object-left-top"
          data-node-id="244:509"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 top-8 z-[2] hidden h-[720px] overflow-visible sm:top-10 lg:block"
        aria-hidden
      >
        <Image
          src={CONTACT_HAND_QUILL_SRC}
          alt=""
          width={510}
          height={604}
          className="absolute top-35 right-0 h-auto w-[min(40vw,530px)] max-w-none object-contain object-right-top"
          data-node-id="251:510"
        />
      </div>
    </>
  );
}
