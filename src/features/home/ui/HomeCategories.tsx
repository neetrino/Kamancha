import {
  HomeCategoryCard,
  type HomeCategoryCardItem,
} from "@/features/home/ui/HomeCategoryCard";
import {
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
} from "@/features/home/ui/home-motion";
import { HomeScrollRail } from "@/features/home/ui/HomeScrollRail";

const RAIL_INSET = "px-16";
const TITLE_CLASS =
  "font-big-fat-boii text-[40px] leading-[1.05] font-normal text-white sm:text-[48px] md:text-[58px] md:leading-[60px]";

type HomeCategoriesProps = {
  title: string;
  productCountLabel: string;
  emptyLabel: string;
  previousLabel: string;
  nextLabel: string;
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
  previousLabel,
  nextLabel,
  categories,
}: HomeCategoriesProps) {
  return (
    <section className="relative z-[1] pt-10 pb-6 sm:pt-12 md:pt-14">
      {categories.length === 0 ? (
        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
          <HomeReveal>
            <h2
              data-node-id="22:205"
              className={`mb-10 text-left ${RAIL_INSET} ${TITLE_CLASS} sm:mb-11 md:mb-[42px]`}
            >
              {title}
            </h2>
          </HomeReveal>
          <p className={`text-left text-white/70 ${RAIL_INSET}`}>{emptyLabel}</p>
        </div>
      ) : (
        <HomeScrollRail
          title={title}
          titleNodeId="22:205"
          previousLabel={previousLabel}
          nextLabel={nextLabel}
          insetClassName={RAIL_INSET}
          titleClassName={TITLE_CLASS}
        >
          <HomeStagger
            className={`inline-flex gap-[19px] pb-4 pt-5 ${RAIL_INSET}`}
            stagger={0.07}
          >
            {categories.map((category) => (
              <HomeStaggerItem key={category.id} className="shrink-0" y={0}>
                <HomeCategoryCard
                  category={category}
                  productCountLabel={productCountLabel}
                />
              </HomeStaggerItem>
            ))}
          </HomeStagger>
        </HomeScrollRail>
      )}
    </section>
  );
}
