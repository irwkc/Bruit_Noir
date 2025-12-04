-- Add preOrder flag to products for pre-order state
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "preOrder" BOOLEAN NOT NULL DEFAULT FALSE;


