-- CreateEnum
CREATE TYPE "BusinessMemberRole" AS ENUM ('ADMIN', 'EDITOR', 'ANALYST', 'VIEWER');

-- CreateTable
CREATE TABLE "business_memberships" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "BusinessMemberRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_memberships_userId_key" ON "business_memberships"("userId");

-- CreateIndex
CREATE INDEX "business_memberships_businessId_idx" ON "business_memberships"("businessId");

-- AddForeignKey
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;