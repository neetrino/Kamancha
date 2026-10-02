ALTER TABLE "delivery_rules" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{"hy":{"area":"","district":null},"en":{"area":"","district":null},"ru":{"area":"","district":null}}'::jsonb;--> statement-breakpoint
UPDATE "delivery_rules"
SET "translations" = jsonb_build_object(
  'hy', jsonb_build_object('area', COALESCE(NULLIF(trim("city"), ''), ''), 'district', NULLIF(trim("region"), '')),
  'en', jsonb_build_object('area', COALESCE(NULLIF(trim("city"), ''), ''), 'district', NULLIF(trim("region"), '')),
  'ru', jsonb_build_object('area', COALESCE(NULLIF(trim("city"), ''), ''), 'district', NULLIF(trim("region"), ''))
)
WHERE "translations" IS NULL
   OR "translations" = '{}'::jsonb
   OR COALESCE(("translations"->'hy'->>'area'), '') = '';--> statement-breakpoint
ALTER TABLE "delivery_rules" ALTER COLUMN "translations" SET DEFAULT '{"hy":{"area":"","district":null},"en":{"area":"","district":null},"ru":{"area":"","district":null}}'::jsonb;--> statement-breakpoint
ALTER TABLE "delivery_rules" ALTER COLUMN "translations" SET NOT NULL;
