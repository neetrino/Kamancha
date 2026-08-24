ALTER TABLE "order_items" ADD COLUMN "group_order_participant_id" uuid;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "participant_name_snapshot" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "group_order_id" uuid;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "group_order_participant_id" uuid;--> statement-breakpoint
CREATE INDEX "order_items_group_participant_idx" ON "order_items" USING btree ("group_order_participant_id");--> statement-breakpoint
CREATE INDEX "orders_group_order_idx" ON "orders" USING btree ("group_order_id");--> statement-breakpoint
CREATE INDEX "payments_group_participant_idx" ON "payments" USING btree ("group_order_participant_id");