/**
 * One-off: set every sellable unit stock_on_hand to 100_000.
 * SIMPLE products and all variants get 100_000; VARIABLE product rows
 * are recalculated as the sum of their variants.
 * Run: pnpm exec tsx scripts/set-all-stock-100000.ts
 */
import path from "node:path";

import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../src/db/schema";
import { AUTO_REPLENISH_TARGET } from "../src/features/products/domain/auto-replenish-stock";

loadEnv({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}
const resolvedDatabaseUrl: string = databaseUrl;

async function main(): Promise<void> {
  const db = drizzle(neon(resolvedDatabaseUrl), { schema });
  const target = AUTO_REPLENISH_TARGET;
  const now = new Date();

  const simpleProducts = await db
    .update(schema.products)
    .set({
      stockOnHand: target,
      version: sql`${schema.products.version} + 1`,
      updatedAt: now,
    })
    .where(eq(schema.products.kind, "SIMPLE"))
    .returning({ id: schema.products.id });

  const variantsResult = await db
    .update(schema.productVariants)
    .set({
      stockOnHand: target,
      updatedAt: now,
    })
    .returning({
      id: schema.productVariants.id,
      productId: schema.productVariants.productId,
    });

  const stockByProduct = new Map<string, number>();
  for (const row of variantsResult) {
    stockByProduct.set(
      row.productId,
      (stockByProduct.get(row.productId) ?? 0) + target,
    );
  }

  let variableUpdated = 0;
  for (const [productId, stockOnHand] of stockByProduct) {
    await db
      .update(schema.products)
      .set({
        stockOnHand,
        version: sql`${schema.products.version} + 1`,
        updatedAt: now,
      })
      .where(eq(schema.products.id, productId));
    variableUpdated += 1;
  }

  console.log(
    `Updated ${simpleProducts.length} SIMPLE products, ${variantsResult.length} variants, and ${variableUpdated} VARIABLE product aggregates to target ${target}.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
