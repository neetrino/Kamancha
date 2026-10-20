"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { moveItemById } from "@/features/admin/ui/admin-sortable";
import { reorderProductsAction } from "@/features/products/application/admin-product-actions";
import type { AdminProductListItem } from "@/features/products/application/list-admin-products";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";

function sameOrder(
  left: AdminProductListItem[],
  right: AdminProductListItem[],
): boolean {
  if (left.length !== right.length) return false;
  return left.every((item, index) => item.id === right[index]?.id);
}

/** Optimistic menu order for the admin products table. */
export function useAdminProductOrder(
  locale: string,
  products: AdminProductListItem[],
  reorderEnabled: boolean,
) {
  const router = useRouter();
  const [ordered, setOrdered] = useState(products);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    scheduleStateUpdate(setOrdered, products);
  }, [products]);

  function handleReorder(activeId: string, overId: string): void {
    if (!reorderEnabled || isPending) return;
    const previous = ordered;
    const next = moveItemById(ordered, activeId, overId);
    if (sameOrder(previous, next)) return;

    setOrdered(next);
    startTransition(async () => {
      setError(null);
      const result = await reorderProductsAction(locale, {
        orderedIds: next.map((product) => product.id),
      });
      if (!result.ok) {
        setOrdered(previous);
        setError(result.error.message);
        return;
      }
      router.refresh();
    });
  }

  return {
    rows: reorderEnabled ? ordered : products,
    reorderError: error,
    isReordering: isPending,
    handleReorder,
  };
}
