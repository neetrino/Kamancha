import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  createdAtColumn,
  idColumn,
  updatedAtColumn,
} from "@/db/schema/columns";
import { users } from "@/db/schema/identity";

export type BlogTranslation = {
  title: string;
  excerpt?: string;
  body: string;
};

export type BlogTranslationsJson = Partial<
  Record<"hy" | "en" | "ru", BlogTranslation>
>;

/** Storefront articles. One shared slug; copy lives in `translations`. */
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: idColumn(),
    authorUserId: uuid("author_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    slug: text("slug").notNull(),
    translations: jsonb("translations").$type<BlogTranslationsJson>().notNull(),
    isActive: boolean("is_active").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("blog_posts_slug_uidx").on(table.slug),
    index("blog_posts_active_published_idx").on(table.isActive, table.publishedAt),
  ],
);
