import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { products } from "@/db/schema/catalog";
import {
  createdAtColumn,
  deletedAtColumn,
  idColumn,
  updatedAtColumn,
} from "@/db/schema/columns";
import { categoryStatusEnum } from "@/db/schema/enums";

export type AttributeTranslations = Partial<
  Record<"hy" | "en" | "ru", { title: string }>
>;

/** Global reusable axes such as meat type, size, weight, or heat. */
export const attributes = pgTable(
  "attributes",
  {
    id: idColumn(),
    translations: jsonb("translations").$type<AttributeTranslations>().notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    status: categoryStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
    deletedAt: deletedAtColumn(),
  },
  (table) => [
    index("attributes_status_sort_idx").on(table.status, table.sortOrder),
  ],
);

export const attributeValues = pgTable(
  "attribute_values",
  {
    id: idColumn(),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attributes.id, { onDelete: "cascade" }),
    translations: jsonb("translations").$type<AttributeTranslations>().notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index("attribute_values_attribute_sort_idx").on(
      table.attributeId,
      table.sortOrder,
    ),
  ],
);

/** Attributes assigned to one variable product, in display order. */
export const productAttributeLinks = pgTable(
  "product_attribute_links",
  {
    id: idColumn(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attributes.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("product_attribute_links_uidx").on(
      table.productId,
      table.attributeId,
    ),
    index("product_attribute_links_attribute_idx").on(table.attributeId),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: idColumn(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    priceAmount: integer("price_amount").notNull(),
    stockOnHand: integer("stock_on_hand").notNull().default(0),
    imageObjectKey: text("image_object_key"),
    /** Sorted attribute value ids. One combination per product. */
    optionSignature: text("option_signature").notNull(),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("product_variants_sku_uidx").on(table.sku),
    uniqueIndex("product_variants_signature_uidx").on(
      table.productId,
      table.optionSignature,
    ),
    index("product_variants_product_idx").on(table.productId),
    check("product_variants_price_nonneg_chk", sql`${table.priceAmount} >= 0`),
    check("product_variants_stock_nonneg_chk", sql`${table.stockOnHand} >= 0`),
  ],
);

export const productVariantValues = pgTable(
  "product_variant_values",
  {
    id: idColumn(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    attributeId: uuid("attribute_id")
      .notNull()
      .references(() => attributes.id, { onDelete: "restrict" }),
    attributeValueId: uuid("attribute_value_id")
      .notNull()
      .references(() => attributeValues.id, { onDelete: "restrict" }),
    createdAt: createdAtColumn(),
  },
  (table) => [
    uniqueIndex("product_variant_values_variant_attribute_uidx").on(
      table.variantId,
      table.attributeId,
    ),
    index("product_variant_values_value_idx").on(table.attributeValueId),
  ],
);
