CREATE TABLE IF NOT EXISTS "blog_posts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"author_user_id" uuid,
	"slug" text NOT NULL,
	"translations" jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "blog_posts"
    ADD CONSTRAINT "blog_posts_author_user_id_users_id_fk"
    FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id")
    ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_uidx" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "blog_posts_active_published_idx" ON "blog_posts" USING btree ("is_active","published_at");--> statement-breakpoint
ALTER TABLE "media_assets" DROP CONSTRAINT IF EXISTS "media_assets_owner_chk";--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "blog_post_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "media_assets"
    ADD CONSTRAINT "media_assets_blog_post_id_blog_posts_id_fk"
    FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id")
    ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_assets_blog_idx" ON "media_assets" USING btree ("blog_post_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "media_assets_blog_cover_uidx" ON "media_assets" USING btree ("blog_post_id") WHERE "media_assets"."blog_post_id" IS NOT NULL AND "media_assets"."role" = 'COVER';--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_chk" CHECK ((
        ("media_assets"."upload_status" = 'PENDING'
          AND "media_assets"."product_id" IS NULL
          AND "media_assets"."category_id" IS NULL
          AND "media_assets"."hero_slide_id" IS NULL
          AND "media_assets"."popup_id" IS NULL
          AND "media_assets"."blog_post_id" IS NULL)
        OR ("media_assets"."role" = 'BRANDING' AND "media_assets"."purpose" IS NOT NULL)
        OR (
          ("media_assets"."product_id" IS NOT NULL)::int
          + ("media_assets"."category_id" IS NOT NULL)::int
          + ("media_assets"."hero_slide_id" IS NOT NULL)::int
          + ("media_assets"."popup_id" IS NOT NULL)::int
          + ("media_assets"."blog_post_id" IS NOT NULL)::int
        ) = 1
      ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
