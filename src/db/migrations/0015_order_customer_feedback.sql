ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_rating" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_feedback" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_feedback_at" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_rating_chk"
    CHECK ("customer_rating" IS NULL OR ("customer_rating" BETWEEN 1 AND 5));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
