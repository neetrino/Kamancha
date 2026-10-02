ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "admin_seen_at" timestamp with time zone;--> statement-breakpoint
UPDATE "orders" SET "admin_seen_at" = "placed_at" WHERE "admin_seen_at" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_admin_unseen_idx" ON "orders" ("placed_at") WHERE "admin_seen_at" IS NULL;
