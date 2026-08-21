-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Asset Storage Paths
-- Created: 2026-07-12
-- Idempotent: all statements use IF NOT EXISTS / DO NOTHING patterns.
--
-- Adds four columns that store stable Supabase Storage object paths.
-- Paths are permanent identifiers for objects in the storage buckets.
-- They must NEVER be replaced by signed URLs or other expiring references.
--
-- Invariant enforced by application code:
--   draft_storage_path    → path in cms-image-drafts   (private bucket)
--   published_storage_path          → path in cms-image-published (desktop.webp)
--   published_mobile_storage_path   → path in cms-image-published (mobile.webp)
--   original_published_storage_path → path in cms-image-published (original.ext)
--
-- Apply via: supabase db push  OR paste into Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE global_assets
  ADD COLUMN IF NOT EXISTS draft_storage_path              TEXT,
  ADD COLUMN IF NOT EXISTS published_storage_path          TEXT,
  ADD COLUMN IF NOT EXISTS published_mobile_storage_path   TEXT,
  ADD COLUMN IF NOT EXISTS original_published_storage_path TEXT;

-- Index for quick lookup of assets that have a storage-backed draft
CREATE INDEX IF NOT EXISTS idx_global_assets_draft_path
  ON global_assets(draft_storage_path)
  WHERE draft_storage_path IS NOT NULL;

-- Index for assets that have been processed and stored in published bucket
CREATE INDEX IF NOT EXISTS idx_global_assets_published_path
  ON global_assets(published_storage_path)
  WHERE published_storage_path IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTES
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Path structure in cms-image-published:
--   {asset_key}/v{version}/desktop.webp
--   {asset_key}/v{version}/mobile.webp
--   {asset_key}/v{version}/original.{ext}
--
-- published_remote_url must be the permanent public CDN URL obtained from
-- supabase.storage.from('cms-image-published').getPublicUrl(published_storage_path).
-- It must never be set to a signed URL or a draft bucket URL.
--
-- draft_storage_path stores the path in cms-image-drafts (private bucket).
-- Signed preview URLs for this path are generated on demand (1 hour TTL)
-- and must never be persisted to the database.
-- ─────────────────────────────────────────────────────────────────────────────
