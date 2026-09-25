ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "attribute_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "cart_items"
    ADD CONSTRAINT "cart_items_attribute_id_attributes_id_fk"
    FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id")
    ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
ALTER TABLE "group_order_items" ADD COLUMN IF NOT EXISTS "attribute_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "group_order_items"
    ADD CONSTRAINT "group_order_items_attribute_id_attributes_id_fk"
    FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id")
    ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
