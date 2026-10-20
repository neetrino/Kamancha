"use client";

import Image from "next/image";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

import type { AdminProductListItem } from "@/features/products/application/list-admin-products";
import { formatMoneyAmount } from "@/lib/money/format";

type AdminProductDragPreviewProps = {
  locale: string;
  product: AdminProductListItem;
  emptyImageLabel: string;
};

/** Floating card shown while a product row is dragged out of the table. */
export function AdminProductDragPreview({
  locale,
  product,
  emptyImageLabel,
}: AdminProductDragPreviewProps) {
  return (
    <div className="animate-admin-drag-lift flex w-[min(32rem,calc(100vw-2rem))] cursor-grabbing items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-xl ring-1 ring-black/5">
      <GripVertical className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-[10px] text-gray-400">
            {emptyImageLabel}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{product.title}</p>
        <p className="truncate text-xs text-gray-500">{product.slug}</p>
      </div>
      <span className="shrink-0 text-sm font-medium text-gray-900">
        {formatMoneyAmount(product.priceAmount, "AMD", locale)}
      </span>
    </div>
  );
}

/** Resolves the dragged product into the lift preview. */
export function renderAdminProductDragOverlay(
  rows: AdminProductListItem[],
  activeId: string,
  locale: string,
  emptyImageLabel: string,
): ReactNode {
  const product = rows.find((item) => item.id === activeId);
  if (!product) return null;
  return (
    <AdminProductDragPreview
      locale={locale}
      product={product}
      emptyImageLabel={emptyImageLabel}
    />
  );
}
