import { z } from "zod";

export const adminProductsFilterSchema = z.object({
  q: z.string().trim().max(100).optional(),
  sku: z.string().trim().max(64).optional(),
  categoryId: z.string().uuid().optional(),
  stock: z
    .enum(["all", "in_stock", "out_of_stock", "low_stock", "draft"])
    .default("all"),
  sort: z
    .enum(["order", "created", "stock", "price", "title"])
    .default("order"),
  dir: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export type AdminProductsFilter = z.infer<typeof adminProductsFilterSchema>;

/** Full menu order can be dragged only when the table is not filtered or column-sorted. */
export function isAdminProductManualOrder(
  filters: Pick<
    AdminProductsFilter,
    "q" | "sku" | "categoryId" | "stock" | "sort"
  >,
): boolean {
  return (
    filters.sort === "order" &&
    !filters.q &&
    !filters.sku &&
    !filters.categoryId &&
    filters.stock === "all"
  );
}

export const productIdsSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1).max(50),
});

export type ProductIdsInput = z.infer<typeof productIdsSchema>;
