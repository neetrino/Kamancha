import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
} from "drizzle-orm/pg-core";

import {
  createdAtColumn,
  idColumn,
  updatedAtColumn,
} from "@/db/schema/columns";

export type HeroTranslation = {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonUrl?: string;
};

export type HeroTranslationsJson = Partial<
  Record<"hy" | "en" | "ru", HeroTranslation>
>;

export const heroSlides = pgTable(
  "hero_slides",
  {
    id: idColumn(),
    translations: jsonb("translations").$type<HeroTranslationsJson>().notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("hero_slides_active_sort_idx").on(table.isActive, table.sortOrder),
  ],
);
