import {
  HomeCategoryCard,
  type HomeCategoryCardItem,
} from "@/features/home/ui/HomeCategoryCard";
import {
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
} from "@/features/home/ui/home-motion";

type HomeTabletCategoriesProps = {
  title: string;
  productCountLabel: string;
  emptyLabel: string;
  categories: readonly HomeCategoryCardItem[];
};

/**
 * Tablet home categories — three cards per row (744px–1023px, incl. iPad Mini).
 */
export function HomeTabletCategories({
  title,
  productCountLabel,
  emptyLabel,
  categories,
}: HomeTabletCategoriesProps) {
  return (
    <section className="relative z-[1] px-4 pt-8 pb-4 sm:px-6">
      <HomeReveal>
        <h2 className="mb-8 text-center font-big-fat-boii text-[40px] leading-[1.05] font-normal text-white sm:mb-9 sm:text-[48px]">
          {title}
        </h2>
      </HomeReveal>

      {categories.length === 0 ? (
        <p className="text-center text-white/70">{emptyLabel}</p>
      ) : (
        <HomeStagger
          className="grid grid-cols-3 gap-3 sm:gap-4"
          stagger={0.06}
        >
          {categories.map((category) => (
            <HomeStaggerItem key={category.id} className="min-w-0" y={0}>
              <HomeCategoryCard
                category={category}
                productCountLabel={productCountLabel}
                variant="tablet"
              />
            </HomeStaggerItem>
          ))}
        </HomeStagger>
      )}
    </section>
  );
}
