import { AppLink } from "@/components/ui/AppLink";
import { catalogHref } from "@/features/products/application/catalog-search-params";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import {
  CATALOG_CATEGORY_ICON_ALL,
  resolveCatalogCategoryIcon,
} from "@/features/products/ui/catalog-category-icons";
import type { CatalogSidebarCategory } from "@/features/products/ui/CatalogFilterForm";

type MobileCatalogCategoryChipsProps = {
  locale: string;
  filters: CatalogFilters;
  categories: CatalogSidebarCategory[];
  allCategoriesLabel: string;
  categoriesLabel: string;
};

const CHIP_BASE =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold tracking-wide transition-colors";
/** Selected — white pill (matches catalog sort active). */
const CHIP_SELECTED =
  "border-white bg-white text-brand-forest hover:bg-white/95";
/** Idle — translucent on forest. */
const CHIP_IDLE =
  "border-white/25 bg-white/10 text-white hover:bg-white/15";

function CategoryIcon({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

/**
 * Mobile catalog category filters — horizontal scrollable pills with icons
 * (Grill.am MobileCatalogCategoryChips pattern, Kamancha tokens).
 */
export function MobileCatalogCategoryChips({
  locale,
  filters,
  categories,
  allCategoriesLabel,
  categoriesLabel,
}: MobileCatalogCategoryChipsProps) {
  const selectedSlug = filters.category ?? null;

  return (
    <nav
      aria-label={categoriesLabel}
      className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:hidden"
    >
      <ul className="flex w-max items-center gap-2.5 pb-0.5">
        <li>
          <AppLink
            href={catalogHref(locale, filters, {
              category: undefined,
              page: 1,
            })}
            prefetchPolicy="intent"
            scroll={false}
            className={`${CHIP_BASE} ${
              selectedSlug == null ? CHIP_SELECTED : CHIP_IDLE
            }`}
            aria-current={selectedSlug == null ? "page" : undefined}
          >
            <CategoryIcon
              src={CATALOG_CATEGORY_ICON_ALL}
              className="size-4"
            />
            <span className="whitespace-nowrap uppercase">
              {allCategoriesLabel}
            </span>
          </AppLink>
        </li>
        {categories.map((category) => {
          const active = selectedSlug === category.slug;
          const icon = resolveCatalogCategoryIcon(
            category.slug,
            category.title,
          );

          return (
            <li key={category.slug}>
              <AppLink
                href={catalogHref(locale, filters, {
                  category: category.slug,
                  page: 1,
                })}
                prefetchPolicy="intent"
                scroll={false}
                className={`${CHIP_BASE} ${
                  active ? CHIP_SELECTED : CHIP_IDLE
                }`}
                aria-current={active ? "page" : undefined}
              >
                <CategoryIcon src={icon} className="size-4" />
                <span className="whitespace-nowrap uppercase">
                  {category.title}
                </span>
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
