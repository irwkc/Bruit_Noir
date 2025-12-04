-- Add delivery price to SiteSettings
ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "deliveryPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;


