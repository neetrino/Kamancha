import "server-only";

import { and, avg, count, countDistinct, desc, eq, isNotNull, max } from "drizzle-orm";

import { getDb } from "@/db/client";
import { orderItems, orders, products } from "@/db/schema";
import { loadPrimaryProductImageUrls } from "@/features/products/application/product-primary-images";
import type { Locale } from "@/lib/i18n/config";

const PAGE_SIZE = 20;

export type AdminReviewedProduct = {
  productId: string;
  title: string;
  sku: string;
  imageUrl: string | null;
  reviewCount: number;
  averageRating: number | null;
  lastReviewAt: Date | null;
};

export type AdminProductReview = {
  orderId: string;
  orderNumber: string;
  rating: number;
  comment: string | null;
  createdAt: Date | null;
  authorName: string;
  authorEmail: string;
};

export type AdminProductReviewsDetail = {
  product: Pick<AdminReviewedProduct, "productId" | "title" | "sku" | "imageUrl">;
  reviews: AdminProductReview[];
};

function productTitle(
  translations: (typeof products.$inferSelect)["translations"],
  locale: Locale,
  fallback: string,
): string {
  return translations[locale]?.title ?? translations.hy?.title ?? fallback;
}

function roundRating(value: string | null): number | null {
  return value == null ? null : Math.round(Number(value) * 10) / 10;
}

/** One row per (order, product) so variants of the same product do not double-count feedback. */
function reviewedOrderProducts() {
  return getDb()
    .selectDistinct({ orderId: orderItems.orderId, productId: orderItems.productId })
    .from(orderItems)
    .where(isNotNull(orderItems.productId))
    .as("reviewed_order_products");
}

/** Products included in orders that received customer feedback, newest feedback first. */
export async function listAdminReviewedProducts(
  locale: Locale,
  page: number,
): Promise<{ rows: AdminReviewedProduct[]; total: number; pageSize: number }> {
  const db = getDb();
  const linked = reviewedOrderProducts();
  const lastReviewAt = max(orders.customerFeedbackAt);
  const hasFeedback = isNotNull(orders.customerRating);

  const [rows, [totalRow]] = await Promise.all([
    db
      .select({
        productId: products.id,
        sku: products.sku,
        translations: products.translations,
        reviewCount: count(orders.id),
        averageRating: avg(orders.customerRating),
        lastReviewAt,
      })
      .from(linked)
      .innerJoin(orders, eq(orders.id, linked.orderId))
      .innerJoin(products, eq(products.id, linked.productId))
      .where(hasFeedback)
      .groupBy(products.id)
      .orderBy(desc(lastReviewAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ value: countDistinct(linked.productId) })
      .from(linked)
      .innerJoin(orders, eq(orders.id, linked.orderId))
      .where(hasFeedback),
  ]);

  const images = await loadPrimaryProductImageUrls(rows.map((row) => row.productId));

  return {
    total: totalRow?.value ?? 0,
    pageSize: PAGE_SIZE,
    rows: rows.map((row) => ({
      productId: row.productId,
      sku: row.sku,
      title: productTitle(row.translations, locale, row.sku),
      imageUrl: images.get(row.productId) ?? null,
      reviewCount: row.reviewCount,
      averageRating: roundRating(row.averageRating),
      lastReviewAt: row.lastReviewAt,
    })),
  };
}

/** Loads one product with every customer feedback left on orders that contain it. */
export async function getAdminProductReviews(
  locale: Locale,
  productId: string,
): Promise<AdminProductReviewsDetail | null> {
  const db = getDb();
  const [product] = await db
    .select({ id: products.id, sku: products.sku, translations: products.translations })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    return null;
  }

  const linked = reviewedOrderProducts();
  const [rows, images] = await Promise.all([
    db
      .select({
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        rating: orders.customerRating,
        comment: orders.customerFeedback,
        createdAt: orders.customerFeedbackAt,
        authorName: orders.contactName,
        authorEmail: orders.contactEmail,
      })
      .from(linked)
      .innerJoin(orders, eq(orders.id, linked.orderId))
      .where(and(eq(linked.productId, productId), isNotNull(orders.customerRating)))
      .orderBy(desc(orders.customerFeedbackAt)),
    loadPrimaryProductImageUrls([productId]),
  ]);

  return {
    product: {
      productId: product.id,
      sku: product.sku,
      title: productTitle(product.translations, locale, product.sku),
      imageUrl: images.get(product.id) ?? null,
    },
    reviews: rows.flatMap((row) =>
      row.rating == null ? [] : [{ ...row, rating: row.rating }],
    ),
  };
}
