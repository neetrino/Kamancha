ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at" DESC, "id" DESC) AS rn
  FROM "products"
  WHERE "deleted_at" IS NULL
)
UPDATE "products" AS p
SET "sort_order" = ranked.rn
FROM ranked
WHERE p."id" = ranked."id";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_status_sort_idx" ON "products" USING btree ("status","sort_order");
