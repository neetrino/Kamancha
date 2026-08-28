import { notFound } from "next/navigation";

import { AdminPagination } from "@/features/admin/ui/AdminPagination";
import { ADMIN_PAGE_TITLE } from "@/features/admin/ui/admin-form-classes";
import {
  listAdminCategoryOptions,
  listAdminProducts,
} from "@/features/products/application/list-admin-products";
import { listModifiersForProductAdmin } from "@/features/products/application/product-modifiers";
import { adminProductsFilterSchema } from "@/features/products/schemas/admin-list";
import { AdminProductsView } from "@/features/products/ui/AdminProductsView";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AdminProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function buildQuery(
  filters: {
    q?: string;
    sku?: string;
    categoryId?: string;
    stock: string;
    sort: string;
    dir: string;
    page: number;
  },
  overrides: Partial<typeof filters> = {},
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.sku) params.set("sku", merged.sku);
  if (merged.categoryId) params.set("categoryId", merged.categoryId);
  if (merged.stock !== "all") params.set("stock", merged.stock);
  if (merged.sort !== "created") params.set("sort", merged.sort);
  if (merged.dir !== "desc") params.set("dir", merged.dir);
  if (merged.page > 1) params.set("page", String(merged.page));
  return params.toString();
}

export default async function AdminProductsPage({
  params,
  searchParams,
}: AdminProductsPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dict = getDictionary(locale);
  const adminCopy = dict.admin;

  const raw = await searchParams;
  const parsed = adminProductsFilterSchema.safeParse({
    q: firstParam(raw.q) || undefined,
    sku: firstParam(raw.sku) || undefined,
    categoryId: firstParam(raw.categoryId) || undefined,
    stock: firstParam(raw.stock) ?? "all",
    sort: firstParam(raw.sort) ?? "created",
    dir: firstParam(raw.dir) ?? "desc",
    page: firstParam(raw.page) ?? "1",
  });

  const filters = parsed.success
    ? parsed.data
    : {
        page: 1 as const,
        stock: "all" as const,
        sort: "created" as const,
        dir: "desc" as const,
        q: undefined,
        sku: undefined,
        categoryId: undefined,
      };

  const [{ rows, total, pageSize }, categories, modifierLibrary] =
    await Promise.all([
      listAdminProducts(locale, filters),
      listAdminCategoryOptions(locale),
      listModifiersForProductAdmin(null),
    ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function sortHref(sort: "title" | "stock" | "price" | "created"): string {
    const nextDir =
      filters.sort === sort && filters.dir === "asc" ? "desc" : "asc";
    const query = buildQuery(filters, {
      sort,
      dir: filters.sort === sort ? nextDir : "asc",
      page: 1,
    });
    return query
      ? `/${locale}/admin/products?${query}`
      : `/${locale}/admin/products`;
  }

  const sortLinks = {
    title: sortHref("title"),
    stock: sortHref("stock"),
    price: sortHref("price"),
    created: sortHref("created"),
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className={ADMIN_PAGE_TITLE}>{adminCopy.products.title}</h1>
      </div>

      <AdminProductsView
        locale={locale}
        products={rows}
        sortLinks={sortLinks}
        categories={categories}
        modifierLibrary={modifierLibrary}
        total={total}
        q={filters.q}
        categoryId={filters.categoryId}
        stock={filters.stock}
        sort={filters.sort}
        dir={filters.dir}
        copy={{
          products: adminCopy.products,
          common: adminCopy.common,
          confirm: adminCopy.confirm,
        }}
      />

      <AdminPagination
        page={filters.page}
        totalPages={totalPages}
        ariaLabel={adminCopy.products.title}
        previousLabel={adminCopy.common.previous}
        nextLabel={adminCopy.common.next}
        pageOfLabel={adminCopy.common.pageOf}
        prevHref={`/${locale}/admin/products?${buildQuery(filters, { page: filters.page - 1 })}`}
        nextHref={`/${locale}/admin/products?${buildQuery(filters, { page: filters.page + 1 })}`}
      />
    </section>
  );
}
