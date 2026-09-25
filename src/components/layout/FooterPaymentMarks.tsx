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

type FooterPaymentMarksProps = {
  /** `grid` is the mobile policies page: two marks per row. */
  layout?: "row" | "grid";
};

/** Policies-page pills are taller, so the marks inside scale up with them. */
const GRID_MARK_SCALE = 1.4;
const ARCA_GRID_MARK_SCALE = 1.2;
/** Desktop footer Visa wordmark sits a bit larger inside the same pill. */
const VISA_ROW_SCALE = 18 / 14;

function scaledMark(
  mark: (typeof PAYMENT_MARKS)[number],
  scale: number,
) {
  return {
    ...mark,
    width: Math.round(mark.width * scale),
    height: Math.round(mark.height * scale),
  };
}

function markSize(mark: (typeof PAYMENT_MARKS)[number], layout: "row" | "grid") {
  if (layout === "row") {
    return mark.alt === "Visa" ? scaledMark(mark, VISA_ROW_SCALE) : mark;
  }
  const scale = mark.alt === "Arca" ? ARCA_GRID_MARK_SCALE : GRID_MARK_SCALE;
  return scaledMark(mark, scale);
}

export function FooterPaymentMarks({ layout = "row" }: FooterPaymentMarksProps) {
  const listClassName =
    layout === "grid"
      ? "grid grid-cols-2 gap-3 xl:hidden"
      : "ml-auto hidden shrink-0 items-center gap-6 xl:flex";
  const itemClassName =
    layout === "grid"
      ? "flex h-12 w-full items-center justify-center rounded-[15px] bg-white px-4"
      : "flex h-10 items-center justify-center rounded-[15px] bg-white px-4";

  return (
    <ul className={listClassName}>
      {PAYMENT_MARKS.map((source) => {
        const mark = markSize(source, layout);
        return (
          <li key={mark.alt} className={itemClassName}>
            <Image
              src={staticAssetUrl(mark.src, { sameOrigin: true })}
              alt={mark.alt}
              width={mark.width}
              height={mark.height}
              unoptimized
              style={{ width: "auto", height: mark.height }}
            />
          </li>
        );
      })}
    </ul>
  );
}
