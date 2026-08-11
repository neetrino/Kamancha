"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { ProductGalleryImage } from "@/features/products/types";

const ZOOM_SRC = "/assets/brand/product/zoom-in.svg";

type ProductGalleryProps = {
  images: ProductGalleryImage[];
  title: string;
  discountPercent?: number | null;
  discountOffLabel?: string;
  inStock: boolean;
  outOfStockLabel: string;
  zoomLabel: string;
  closeZoomLabel: string;
};

function formatDiscountOff(template: string, percent: number): string {
  return template.replace("{percent}", String(percent));
}

export function ProductGallery({
  images,
  title,
  discountPercent = null,
  discountOffLabel = "{percent}% Off",
  inStock,
  outOfStockLabel,
  zoomLabel,
  closeZoomLabel,
}: ProductGalleryProps) {
  const [selectedId, setSelectedId] = useState(images[0]?.id ?? null);
  const [zoomed, setZoomed] = useState(false);
  const selected =
    images.find((image) => image.id === selectedId) ?? images[0] ?? null;

  useEffect(() => {
    if (!zoomed) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setZoomed(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomed]);

  return (
    <div className="flex w-full max-w-[520px] flex-col gap-4">
      <div className="relative aspect-[520/420] w-full overflow-hidden rounded-[30px] border-[3px] border-white bg-white">
        {selected ? (
          <Image
            src={selected.url}
            alt={selected.alt || title}
            fill
            sizes="(max-width: 1024px) 100vw, 520px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-brand-forest/40">
            No image
          </div>
        )}

        {discountPercent != null ? (
          <span className="absolute top-3 left-3 z-10 inline-flex h-[33px] min-w-24 items-center justify-center rounded-[30px] bg-[#84d086] px-3 text-sm font-bold text-[#132814]">
            {formatDiscountOff(discountOffLabel, discountPercent)}
          </span>
        ) : null}

        {!inStock ? (
          <span className="absolute top-3 left-3 z-10 rounded-[30px] bg-[#132814]/90 px-3 py-1.5 text-sm font-semibold text-white">
            {outOfStockLabel}
          </span>
        ) : null}

        {selected ? (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label={zoomLabel}
            className="absolute right-4 bottom-4 z-10 inline-flex items-center justify-center rounded-full bg-black/50 px-2.5 py-1.5 transition hover:bg-black/70"
          >
            <Image src={ZOOM_SRC} alt="" width={24} height={24} aria-hidden />
          </button>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="flex gap-2.5" role="list">
          {images.map((image) => {
            const isActive = image.id === selected?.id;
            return (
              <li key={image.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setSelectedId(image.id)}
                  aria-label={image.alt || title}
                  aria-pressed={isActive}
                  className={`relative h-[72px] w-full overflow-hidden rounded-2xl transition sm:h-[90px] ${
                    isActive
                      ? "border-2 border-[#84d086] opacity-100 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
                      : "border-2 border-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {zoomed && selected ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={zoomLabel}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            onClick={() => setZoomed(false)}
          >
            {closeZoomLabel}
          </button>
          <div
            className="relative h-[min(80vh,720px)] w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selected.url}
              alt={selected.alt || title}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
