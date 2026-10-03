-- DESTRUCTIVE: remove blog CMS (media links, posts table, enum, store setting).
DELETE FROM "media_assets" WHERE "blog_post_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" DROP CONSTRAINT IF EXISTS "media_assets_owner_chk";--> statement-breakpoint
ALTER TABLE "media_assets" DROP CONSTRAINT IF EXISTS "media_assets_blog_post_id_blog_posts_id_fk";--> statement-breakpoint
DROP INDEX IF EXISTS "media_assets_blog_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "media_assets_blog_cover_uidx";--> statement-breakpoint
ALTER TABLE "media_assets" DROP COLUMN IF EXISTS "blog_post_id";--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_chk" CHECK ((
        ("media_assets"."upload_status" = 'PENDING'
          AND "media_assets"."product_id" IS NULL
          AND "media_assets"."category_id" IS NULL
          AND "media_assets"."hero_slide_id" IS NULL
          AND "media_assets"."popup_id" IS NULL)
        OR ("media_assets"."role" = 'BRANDING' AND "media_assets"."purpose" IS NOT NULL)
        OR (
          ("media_assets"."product_id" IS NOT NULL)::int
          + ("media_assets"."category_id" IS NOT NULL)::int
          + ("media_assets"."hero_slide_id" IS NOT NULL)::int
          + ("media_assets"."popup_id" IS NOT NULL)::int
        ) = 1
      ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DROP TABLE IF EXISTS "blog_posts";--> statement-breakpoint
DROP TYPE IF EXISTS "public"."blog_post_status";--> statement-breakpoint
DELETE FROM "store_settings" WHERE "key" = 'store.blog';
