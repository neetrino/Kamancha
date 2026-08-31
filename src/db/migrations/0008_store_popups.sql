DO $$ BEGIN
  ALTER TYPE "public"."media_role" ADD VALUE 'POPUP';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "store_popups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"link_url" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "media_assets" DROP CONSTRAINT IF EXISTS "media_assets_owner_chk";--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "popup_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "store_popups_active_idx" ON "store_popups" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "store_popups_one_active_uidx" ON "store_popups" USING btree ("is_active") WHERE "store_popups"."is_active" = true;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "media_assets"
    ADD CONSTRAINT "media_assets_popup_id_store_popups_id_fk"
    FOREIGN KEY ("popup_id") REFERENCES "public"."store_popups"("id")
    ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_assets_popup_idx" ON "media_assets" USING btree ("popup_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "media_assets_popup_uidx" ON "media_assets" USING btree ("popup_id") WHERE "media_assets"."popup_id" IS NOT NULL AND "media_assets"."role" = 'POPUP';--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_chk" CHECK ((
        ("media_assets"."upload_status" = 'PENDING'
          AND "media_assets"."product_id" IS NULL
          AND "media_assets"."category_id" IS NULL
          AND "media_assets"."hero_slide_id" IS NULL
          AND "media_assets"."blog_post_id" IS NULL
          AND "media_assets"."popup_id" IS NULL)
        OR ("media_assets"."role" = 'BRANDING' AND "media_assets"."purpose" IS NOT NULL)
        OR (
          ("media_assets"."product_id" IS NOT NULL)::int
          + ("media_assets"."category_id" IS NOT NULL)::int
          + ("media_assets"."hero_slide_id" IS NOT NULL)::int
          + ("media_assets"."blog_post_id" IS NOT NULL)::int
          + ("media_assets"."popup_id" IS NOT NULL)::int
        ) = 1
      ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
