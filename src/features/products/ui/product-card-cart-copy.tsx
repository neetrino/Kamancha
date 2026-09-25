"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ProductCardCartCopy = {
  piecesCount: string;
  decreaseQuantity: string;
  increaseQuantity: string;
};

const ProductCardCartCopyContext = createContext<ProductCardCartCopy | null>(
  null,
);

export function ProductCardCartCopyProvider({
  copy,
  children,
}: {
  copy: ProductCardCartCopy;
  children: ReactNode;
}) {
  return (
    <ProductCardCartCopyContext.Provider value={copy}>
      {children}
    </ProductCardCartCopyContext.Provider>
  );
}

export function useProductCardCartCopy(): ProductCardCartCopy {
  const copy = useContext(ProductCardCartCopyContext);
  if (!copy) {
    throw new Error("ProductCardCartCopyProvider is missing.");
  }
  return copy;
}
