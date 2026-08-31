DO $$ BEGIN
  ALTER TYPE "public"."group_order_status" ADD VALUE 'PARTIALLY_PAID';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
