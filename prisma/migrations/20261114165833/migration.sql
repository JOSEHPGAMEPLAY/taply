-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'PAUSED', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PageVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "NfcTagStatus" AS ENUM ('INVENTORY', 'PENDING_PROGRAMMING', 'PROGRAMMED', 'ACTIVE', 'INACTIVE', 'LOST', 'DAMAGED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PAGE_VIEW', 'BUTTON_CLICK', 'TAG_SCAN');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'UNPUBLISH', 'ASSIGN', 'UNASSIGN', 'LOGIN', 'LOGOUT', 'PAYMENT', 'SUBSCRIPTION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "emailVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "BusinessStatus" NOT NULL DEFAULT 'PROSPECT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "config" JSONB,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "templateId" TEXT,
    "slug" TEXT NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_versions" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "status" "PageVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "config" JSONB,
    "buttons" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nfc_tags" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "NfcTagStatus" NOT NULL DEFAULT 'INVENTORY',
    "programmedUrl" TEXT,
    "programmedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nfc_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_assignments" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "tagId" TEXT,
    "type" "AnalyticsEventType" NOT NULL,
    "buttonKey" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'ONE_TIME',
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "provider" TEXT,
    "providerReference" TEXT,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "nextBillingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_entitlements" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "action" "AuditAction" NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_sessionToken_key" ON "auth_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "auth_sessions_userId_idx" ON "auth_sessions"("userId");

-- CreateIndex
CREATE INDEX "auth_sessions_sessionToken_idx" ON "auth_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_tokenHash_key" ON "auth_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "auth_tokens_userId_idx" ON "auth_tokens"("userId");

-- CreateIndex
CREATE INDEX "auth_tokens_tokenHash_idx" ON "auth_tokens"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_key" ON "businesses"("slug");

-- CreateIndex
CREATE INDEX "businesses_ownerId_idx" ON "businesses"("ownerId");

-- CreateIndex
CREATE INDEX "businesses_slug_idx" ON "businesses"("slug");

-- CreateIndex
CREATE INDEX "templates_name_idx" ON "templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pages_publishedVersionId_key" ON "pages"("publishedVersionId");

-- CreateIndex
CREATE INDEX "pages_businessId_idx" ON "pages"("businessId");

-- CreateIndex
CREATE INDEX "pages_publishedVersionId_idx" ON "pages"("publishedVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "pages_businessId_slug_key" ON "pages"("businessId", "slug");

-- CreateIndex
CREATE INDEX "page_versions_pageId_idx" ON "page_versions"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "nfc_tags_token_key" ON "nfc_tags"("token");

-- CreateIndex
CREATE INDEX "nfc_tags_businessId_idx" ON "nfc_tags"("businessId");

-- CreateIndex
CREATE INDEX "nfc_tags_token_idx" ON "nfc_tags"("token");

-- CreateIndex
CREATE INDEX "tag_assignments_tagId_idx" ON "tag_assignments"("tagId");

-- CreateIndex
CREATE INDEX "tag_assignments_pageId_idx" ON "tag_assignments"("pageId");

-- CreateIndex
CREATE INDEX "analytics_events_pageId_idx" ON "analytics_events"("pageId");

-- CreateIndex
CREATE INDEX "analytics_events_tagId_idx" ON "analytics_events"("tagId");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE INDEX "billing_products_type_idx" ON "billing_products"("type");

-- CreateIndex
CREATE UNIQUE INDEX "orders_number_key" ON "orders"("number");

-- CreateIndex
CREATE INDEX "orders_businessId_idx" ON "orders"("businessId");

-- CreateIndex
CREATE INDEX "orders_number_idx" ON "orders"("number");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_eventId_key" ON "payments"("eventId");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_eventId_idx" ON "payments"("eventId");

-- CreateIndex
CREATE INDEX "subscriptions_businessId_idx" ON "subscriptions"("businessId");

-- CreateIndex
CREATE INDEX "subscriptions_productId_idx" ON "subscriptions"("productId");

-- CreateIndex
CREATE INDEX "business_entitlements_businessId_idx" ON "business_entitlements"("businessId");

-- CreateIndex
CREATE INDEX "business_entitlements_feature_idx" ON "business_entitlements"("feature");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_versions" ADD CONSTRAINT "page_versions_id_fkey" FOREIGN KEY ("id") REFERENCES "pages"("publishedVersionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nfc_tags" ADD CONSTRAINT "nfc_tags_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignments" ADD CONSTRAINT "tag_assignments_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "nfc_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignments" ADD CONSTRAINT "tag_assignments_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "nfc_tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "billing_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "billing_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_entitlements" ADD CONSTRAINT "business_entitlements_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
