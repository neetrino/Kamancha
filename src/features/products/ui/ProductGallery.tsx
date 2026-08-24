"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { ProductGalleryImage } from "@/features/products/types";
import { WishlistButton } from "@/features/wishlist/ui/WishlistButton";
import { clearActiveFocus } from "@/lib/dom/clear-active-focus";
import type { Locale } from "@/lib/i18n/config";
import { STOREFRONT_PRODUCT_PHOTO } from "@/lib/media/storefront-product-photo";

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
  previousImageLabel: string;
  nextImageLabel: string;
  locale: Locale;
  productId: string;
  inWishlist: boolean;
  isSignedIn: boolean;
  wishlistLabel: string;
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
  previousImageLabel,
  nextImageLabel,
  locale,
  productId,
  inWishlist,
  isSignedIn,
  wishlistLabel,
}: ProductGalleryProps) {
  const galleryImages = useMemo<ProductGalleryImage[]>(
    () =>
      images.length > 0
        ? images.map((image) => ({
            ...image,
            url: STOREFRONT_PRODUCT_PHOTO,
          }))
        : [
            {
              id: "placeholder",
              url: STOREFRONT_PRODUCT_PHOTO,
              alt: title,
              isPrimary: true,
            },
          ],
    [images, title],
  );
  const [selectedId, setSelectedId] = useState(galleryImages[0]?.id ?? null);
  const [zoomed, setZoomed] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const selectedIndex = Math.max(
    0,
    galleryImages.findIndex((image) => image.id === selectedId),
  );
  const selected = galleryImages[selectedIndex] ?? galleryImages[0] ?? null;
  const canCycle = galleryImages.length > 1;

  function goToOffset(offset: number): void {
    if (!canCycle) return;
    setSelectedId((currentId) => {
      const currentIndex = Math.max(
        0,
        galleryImages.findIndex((image) => image.id === currentId),
      );
      const nextIndex =
        (currentIndex + offset + galleryImages.length) % galleryImages.length;
      return galleryImages[nextIndex]?.id ?? currentId;
    });
  }

  function closeZoom(): void {
    setZoomed(false);
    clearActiveFocus();
  }

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!zoomed) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        closeZoom();
        return;
      }
      if (!canCycle) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSelectedId((currentId) => {
          const currentIndex = Math.max(
            0,
            galleryImages.findIndex((image) => image.id === currentId),
          );
          const nextIndex =
            (currentIndex - 1 + galleryImages.length) % galleryImages.length;
          return galleryImages[nextIndex]?.id ?? currentId;
        });
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSelectedId((currentId) => {
          const currentIndex = Math.max(
            0,
            galleryImages.findIndex((image) => image.id === currentId),
          );
          const nextIndex = (currentIndex + 1) % galleryImages.length;
          return galleryImages[nextIndex]?.id ?? currentId;
        });
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [zoomed, canCycle, galleryImages]);

  const lightbox =
    zoomed && selected && portalReady
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={zoomLabel}
            className="fixed inset-0 z-[300] flex h-dvh w-screen items-center justify-center"
          >
            <button
              type="button"
              aria-label={closeZoomLabel}
              className="absolute inset-0 cursor-pointer bg-black/80"
              onClick={closeZoom}
            />

            <button
              type="button"
              aria-label={closeZoomLabel}
              className="absolute top-5 right-5 z-20 flex size-11 items-center justify-center rounded-full bg-white/15 text-white outline-none transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:top-8 sm:right-8"
              onClick={closeZoom}
            >
              <X className="size-6" strokeWidth={2.25} aria-hidden />
            </button>

            {canCycle ? (
              <>
                <button
                  type="button"
                  aria-label={previousImageLabel}
                  onClick={() => goToOffset(-1)}
                  className="absolute top-1/2 left-3 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:left-8 sm:size-12"
                >
                  <ChevronLeft className="size-7" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={nextImageLabel}
                  onClick={() => goToOffset(1)}
                  className="absolute top-1/2 right-3 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 sm:right-8 sm:size-12"
                >
                  <ChevronRight className="size-7" aria-hidden />
                </button>
              </>
            ) : null}

            <div className="relative z-10 mx-auto flex h-[min(86dvh,880px)] w-[min(92vw,920px)] items-center justify-center p-2">
              <div className="relative h-full w-full">
                <Image
                  src={selected.url}
                  alt={selected.alt || title}
                  fill
                  sizes="(max-width: 920px) 92vw, 920px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="flex w-full flex-col gap-4 xl:w-[min(100%,640px)] xl:shrink-0">
      <div className="group relative aspect-[520/420] w-full overflow-hidden rounded-[30px] border-[3px] border-white bg-white">
        {selected ? (
          <Image
            src={selected.url}
            alt={selected.alt || title}
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
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

        <WishlistButton
          locale={locale}
          productId={productId}
          initialInWishlist={inWishlist}
          isSignedIn={isSignedIn}
          label={wishlistLabel}
          size="lg"
          className="absolute top-3 right-3 z-10 size-11 bg-white text-brand-forest shadow-sm hover:bg-white/90"
        />

        {canCycle ? (
          <>
            <button
              type="button"
              aria-label={previousImageLabel}
              onClick={() => goToOffset(-1)}
              className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-100 shadow-md transition hover:bg-black/65 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={nextImageLabel}
              onClick={() => goToOffset(1)}
              className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-100 shadow-md transition hover:bg-black/65 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:opacity-0 md:group-hover:opacity-100"
            >
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </>
        ) : null}

        {selected ? (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            aria-label={zoomLabel}
            className="absolute right-4 bottom-4 z-10 inline-flex items-center justify-center rounded-full bg-black/50 px-2.5 py-1.5 outline-none transition hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <Image src={ZOOM_SRC} alt="" width={24} height={24} aria-hidden />
          </button>
        ) : null}
      </div>

      {galleryImages.length > 1 ? (
        <ul className="flex flex-wrap gap-2.5" role="list">
          {galleryImages.map((image) => {
            const isActive = image.id === selected?.id;
            return (
              <li
                key={image.id}
                className="size-[72px] shrink-0 sm:size-[90px]"
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(image.id)}
                  aria-label={image.alt || title}
                  aria-pressed={isActive}
                  className={`relative size-full overflow-hidden rounded-2xl transition ${
                    isActive
                      ? "border-2 border-[#84d086] opacity-100 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]"
                      : "border-2 border-transparent opacity-60 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="90px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {lightbox}
    </div>
  );
}
