import Image from "next/image";

import { staticAssetUrl } from "@/lib/media/static-asset-url";

/** Footer payment marks, slightly under the Mobee footer logo heights. */
const PAYMENT_MARKS = [
  {
    src: "/assets/brand/footer/mastercard.webp",
    alt: "Mastercard",
    width: 34,
    height: 26,
  },
  {
    src: "/assets/brand/footer/arca.webp",
    alt: "Arca",
    width: 66,
    height: 17,
  },
  {
    src: "/assets/brand/footer/idram.webp",
    alt: "Idram",
    width: 73,
    height: 21,
  },
  {
    src: "/assets/brand/footer/visa.webp",
    alt: "Visa",
    width: 43,
    height: 14,
  },
] as const;

export function FooterPaymentMarks() {
  return (
    <ul className="ml-auto hidden shrink-0 items-center gap-6 xl:flex">
      {PAYMENT_MARKS.map((mark) => (
        <li
          key={mark.alt}
          className="flex h-10 items-center justify-center rounded-[15px] bg-white px-4"
        >
          <Image
            src={staticAssetUrl(mark.src, { sameOrigin: true })}
            alt={mark.alt}
            width={mark.width}
            height={mark.height}
            unoptimized
            style={{ width: "auto", height: mark.height }}
          />
        </li>
      ))}
    </ul>
  );
}
