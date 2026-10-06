"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";

import type {
  AdminCategoryOption,
  AdminProductListItem,
} from "@/features/products/application/list-admin-products";
import type { AdminProductsFilter } from "@/features/products/schemas/admin-list";
import type { AttributeOption } from "@/features/attributes/types";
import type { ProductModifierOption } from "@/features/products/types/modifiers";
import { AdminProductsFilters } from "@/features/products/ui/AdminProductsFilters";
import { AdminProductsTable } from "@/features/products/ui/AdminProductsTable";
import { ProductDrawer } from "@/features/products/ui/ProductDrawer";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminProductsSortLinks = {
  title: string;
  stock: string;
  price: string;
  created: string;
};

type ViewCopy = {
  products: Dictionary["admin"]["products"];
  common: Dictionary["admin"]["common"];
  confirm: Dictionary["admin"]["confirm"];
};

type AdminProductsViewProps = {
  locale: string;
  products: AdminProductListItem[];
  sortLinks: AdminProductsSortLinks;
  categories: AdminCategoryOption[];
  modifierLibrary: ProductModifierOption[];
  attributeLibrary: AttributeOption[];
  total: number;
  q?: string;
  categoryId?: string;
  stock: AdminProductsFilter["stock"];
  sort: string;
  dir: string;
  copy: ViewCopy;
};

export function AdminProductsView({
  locale,
  products,
  sortLinks,
  categories,
  modifierLibrary,
  attributeLibrary,
  total,
  q,
  categoryId,
  stock,
  sort,
  dir,
  copy,
}: AdminProductsViewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<AdminProductListItem | null>(null);

  function openCreate(): void {
    setEditingProduct(null);
    setDrawerOpen(true);
  }

  function openEdit(product: AdminProductListItem): void {
    setEditingProduct(product);
    setDrawerOpen(true);
  }

  function closeDrawer(): void {
    setDrawerOpen(false);
    setEditingProduct(null);
  }

  return (
    <>
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className={ADMIN_PAGE_TITLE}>{copy.products.title}</h1>
          <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-brand-forest px-2.5 text-sm font-semibold text-white">
            {total}
          </span>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-brand-forest px-4 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          {copy.products.addNewProduct}
        </button>
      </div>

      <AdminProductsFilters
        q={q}
        categoryId={categoryId}
        stock={stock}
        categories={categories}
        sort={sort}
        dir={dir}
        copy={copy.products.filters}
      />

      <AdminProductsTable
        locale={locale}
        products={products}
        sortLinks={sortLinks}
        onEdit={openEdit}
        copy={{
          table: copy.products.table,
          common: copy.common,
          confirm: copy.confirm,
        }}
      />

      <ProductDrawer
        locale={locale}
        open={drawerOpen}
        onClose={closeDrawer}
        product={editingProduct}
        categories={categories}
        modifierLibrary={modifierLibrary}
        attributeLibrary={attributeLibrary}
        copy={{
          drawer: copy.products.drawer,
          categories: copy.products.categories,
          images: copy.products.images,
          discount: copy.products.discount,
          modifiers: copy.products.modifiers,
          attributes: copy.products.attributes,
          common: copy.common,
          confirm: copy.confirm,
        }}
      />
    </>
  );
}
