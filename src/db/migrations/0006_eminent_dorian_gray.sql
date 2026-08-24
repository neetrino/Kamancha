ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "online_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cash_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "orders"
SET
	"cash_amount" = CASE
		WHEN EXISTS (
			SELECT 1 FROM "payments"
			WHERE "payments"."order_id" = "orders"."id" AND "payments"."method" = 'COD'
		) THEN "total_amount"
		ELSE 0
	END,
	"online_amount" = CASE
		WHEN EXISTS (
			SELECT 1 FROM "payments"
			WHERE "payments"."order_id" = "orders"."id" AND "payments"."method" = 'COD'
		) THEN 0
		ELSE "total_amount"
	END
WHERE "online_amount" + "cash_amount" <> "total_amount";--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "orders" ADD CONSTRAINT "orders_online_amount_nonneg_chk" CHECK ("orders"."online_amount" >= 0);
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "orders" ADD CONSTRAINT "orders_cash_amount_nonneg_chk" CHECK ("orders"."cash_amount" >= 0);
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_split_sum_chk" CHECK ("orders"."online_amount" + "orders"."cash_amount" = "orders"."total_amount");
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;
