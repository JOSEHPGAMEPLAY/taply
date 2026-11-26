-- DropIndex
DROP INDEX "analytics_events_pageId_idx";

-- CreateIndex
CREATE INDEX "analytics_events_pageId_createdAt_idx" ON "analytics_events"("pageId", "createdAt");