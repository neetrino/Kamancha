"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
  const orderedRef = useRef(products);
  const snapshotRef = useRef(products);
  const draggingRef = useRef(false);
  const saveGen = useRef(0);
  const appliedGen = useRef(0);

  useEffect(() => {
    if (draggingRef.current || saveGen.current !== appliedGen.current) return;
    orderedRef.current = products;
    snapshotRef.current = products;
    scheduleStateUpdate(setOrdered, products);
  }, [products]);

  function shift(activeId: string, overId: string): void {
    if (!reorderEnabled) return;
    const next = moveItemById(orderedRef.current, activeId, overId);
    if (sameOrder(orderedRef.current, next)) return;
    orderedRef.current = next;
    setOrdered(next);
  }

  function persist(): void {
    draggingRef.current = false;
    const next = orderedRef.current;
    const rollback = snapshotRef.current;
    if (sameOrder(rollback, next)) return;

    const gen = ++saveGen.current;
    startTransition(async () => {
      setError(null);
      const result = await reorderProductsAction(locale, {
        orderedIds: next.map((product) => product.id),
      });
      if (saveGen.current !== gen) return;
      appliedGen.current = gen;
      if (!result.ok) {
        orderedRef.current = rollback;
        setOrdered(rollback);
        setError(result.error.message);
        return;
      }
      snapshotRef.current = next;
      router.refresh();
    });
  }

  function markDragging(): void {
    if (!draggingRef.current) snapshotRef.current = orderedRef.current;
    draggingRef.current = true;
  }

  function cancelDrag(): void {
    draggingRef.current = false;
    orderedRef.current = snapshotRef.current;
    setOrdered(snapshotRef.current);
  }

  return {
    rows: reorderEnabled ? ordered : products,
    reorderError: error,
    isReordering: isPending,
    shift,
    persist,
    markDragging,
    cancelDrag,
  };
}
