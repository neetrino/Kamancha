import { HorizontalWheelScrollArea } from "@/components/ui/HorizontalWheelScrollArea";
import {
  HomeCategoryCard,
  type HomeCategoryCardItem,
} from "@/features/home/ui/HomeCategoryCard";
import {
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
} from "@/features/home/ui/home-motion";

type HomeCategoriesProps = {
  title: string;
  productCountLabel: string;
  emptyLabel: string;
  categories: readonly HomeCategoryCardItem[];
};

/**
 * Home categories — Figma title 22:205 + row 22:209.
 * Full-bleed scroll row; cards keep Figma size (376×135).
 */
export function HomeCategories({
  title,
  productCountLabel,
  emptyLabel,
  categories,
}: HomeCategoriesProps) {
  return (
    <section className="relative z-[1] pt-10 pb-6 sm:pt-12 md:pt-14">
      <HomeReveal>
        <h2
          data-node-id="22:205"
          className="mb-10 text-center font-big-fat-boii text-[40px] leading-[1.05] font-normal text-white sm:mb-11 sm:text-[48px] md:mb-[42px] md:text-[58px] md:leading-[60px]"
        >
          {title}
        </h2>
      </HomeReveal>

      {categories.length === 0 ? (
        <p className="px-5 text-center text-white/70">{emptyLabel}</p>
      ) : (
        <div
          data-node-id="22:209"
          className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2"
        >
          <HorizontalWheelScrollArea>
            <HomeStagger
              className="inline-flex gap-[19px] px-16 py-4"
              stagger={0.07}
            >
              {categories.map((category) => (
                <HomeStaggerItem key={category.id} className="shrink-0" y={0}>
                  <HomeCategoryCard
                    category={category}
                    productCountLabel={productCountLabel}
                    variant="desktop"
                  />
                </HomeStaggerItem>
              ))}
            </HomeStagger>
          </HorizontalWheelScrollArea>
        </div>
      )}
    </section>
  );
}
