DO $$ BEGIN
  CREATE TYPE "public"."product_kind" AS ENUM('SIMPLE', 'VARIABLE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "kind" "product_kind" DEFAULT 'SIMPLE' NOT NULL;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attributes" (
  "id" uuid PRIMARY KEY NOT NULL,
  "translations" jsonb NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "status" "category_status" DEFAULT 'ACTIVE' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attribute_values" (
  "id" uuid PRIMARY KEY NOT NULL,
  "attribute_id" uuid NOT NULL,
  "translations" jsonb NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_attribute_links" (
  "id" uuid PRIMARY KEY NOT NULL,
  "product_id" uuid NOT NULL,
  "attribute_id" uuid NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variants" (
  "id" uuid PRIMARY KEY NOT NULL,
  "product_id" uuid NOT NULL,
  "sku" text NOT NULL,
  "price_amount" integer NOT NULL,
  "stock_on_hand" integer DEFAULT 0 NOT NULL,
  "image_object_key" text,
  "option_signature" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "product_variants_price_nonneg_chk" CHECK ("price_amount" >= 0),
  CONSTRAINT "product_variants_stock_nonneg_chk" CHECK ("stock_on_hand" >= 0)
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variant_values" (
  "id" uuid PRIMARY KEY NOT NULL,
  "variant_id" uuid NOT NULL,
  "attribute_id" uuid NOT NULL,
  "attribute_value_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "attribute_values" ADD CONSTRAINT "attribute_values_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_attribute_links" ADD CONSTRAINT "product_attribute_links_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_attribute_links" ADD CONSTRAINT "product_attribute_links_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_variant_values" ADD CONSTRAINT "product_variant_values_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_variant_values" ADD CONSTRAINT "product_variant_values_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "product_variant_values" ADD CONSTRAINT "product_variant_values_attribute_value_id_attribute_values_id_fk" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."attribute_values"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attributes_status_sort_idx" ON "attributes" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "attribute_values_attribute_sort_idx" ON "attribute_values" USING btree ("attribute_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_attribute_links_uidx" ON "product_attribute_links" USING btree ("product_id","attribute_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_attribute_links_attribute_idx" ON "product_attribute_links" USING btree ("attribute_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_sku_uidx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_variants_signature_uidx" ON "product_variants" USING btree ("product_id","option_signature");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "product_variant_values_variant_attribute_uidx" ON "product_variant_values" USING btree ("variant_id","attribute_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variant_values_value_idx" ON "product_variant_values" USING btree ("attribute_value_id");--> statement-breakpoint
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "variant_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DROP INDEX IF EXISTS "cart_items_cart_product_selection_uidx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_simple_line_uidx" ON "cart_items" USING btree ("cart_id","product_id","selection_key") WHERE "variant_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_variant_line_uidx" ON "cart_items" USING btree ("cart_id","product_id","variant_id","selection_key") WHERE "variant_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cart_items_variant_idx" ON "cart_items" USING btree ("variant_id");--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_label_snapshot" text;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
ALTER TABLE "group_order_items" ADD COLUMN IF NOT EXISTS "variant_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "group_order_items" ADD CONSTRAINT "group_order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DROP INDEX IF EXISTS "group_order_items_participant_product_selection_uidx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "group_order_items_simple_line_uidx" ON "group_order_items" USING btree ("participant_id","product_id","selection_key") WHERE "variant_id" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "group_order_items_variant_line_uidx" ON "group_order_items" USING btree ("participant_id","product_id","variant_id","selection_key") WHERE "variant_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD COLUMN IF NOT EXISTS "variant_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
