-- Product indexes
CREATE INDEX IF NOT EXISTS "Product_category_idx" ON "Product"("category");
CREATE INDEX IF NOT EXISTS "Product_featured_idx" ON "Product"("featured");
CREATE INDEX IF NOT EXISTS "Product_available_idx" ON "Product"("available");

-- Order indexes
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus");


