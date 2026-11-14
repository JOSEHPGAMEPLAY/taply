-- Custom constraints that Prisma doesn't support natively
-- Run after the initial Prisma migration

-- ============================================
-- Partial Unique Indexes
-- ============================================

-- Only one active assignment per tag at a time
CREATE UNIQUE INDEX IF NOT EXISTS uq_tag_assignment_active
  ON "tag_assignments" ("tagId")
  WHERE "endedAt" IS NULL;

-- ============================================
-- CHECK Constraints
-- ============================================

-- BillingProduct: price must be non-negative
ALTER TABLE "billing_products"
  ADD CONSTRAINT chk_billing_product_price_non_negative
  CHECK ("price" >= 0);

-- Order: total must be non-negative
ALTER TABLE "orders"
  ADD CONSTRAINT chk_order_total_non_negative
  CHECK ("total" >= 0);

-- OrderItem: quantity must be positive
ALTER TABLE "order_items"
  ADD CONSTRAINT chk_order_item_quantity_positive
  CHECK ("quantity" > 0);

-- Payment: amount must be non-negative
ALTER TABLE "payments"
  ADD CONSTRAINT chk_payment_amount_non_negative
  CHECK ("amount" >= 0);

-- BusinessEntitlement: source must be ORDER or SUBSCRIPTION
ALTER TABLE "business_entitlements"
  ADD CONSTRAINT chk_business_entitlement_source_valid
  CHECK ("source" IN ('ORDER', 'SUBSCRIPTION'));
