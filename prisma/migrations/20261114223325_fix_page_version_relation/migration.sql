-- Fix: Remove the reverse FK constraint from page_versions.id to pages.publishedVersionId
-- This constraint prevented creating PageVersion records unless their ID was already
-- referenced by a Page's publishedVersionId, which is impossible for new versions.

-- DropForeignKey
ALTER TABLE "page_versions" DROP CONSTRAINT "page_versions_id_fkey";
