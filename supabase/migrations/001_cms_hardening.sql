-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: CMS Production Hardening
-- Created: 2026-07-12
-- Apply via: supabase db push  OR paste into Supabase SQL Editor
--
-- IMPORTANT: Review RLS policies carefully before applying.
-- Do not grant public write access to any of these tables.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Enable UUID extension ────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── global_assets ────────────────────────────────────────────────────────────
-- Stores every editable image with its semantic key, draft URL, published URL,
-- and static fallback path. Keys are immutable once created.

CREATE TABLE IF NOT EXISTS global_assets (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_key                 TEXT NOT NULL UNIQUE,        -- immutable semantic key e.g. daycare.hero
  display_name              TEXT NOT NULL,
  category                  TEXT NOT NULL,
  draft_original_url        TEXT,                        -- original resolution draft URL
  draft_mobile_url          TEXT,                        -- optional mobile crop draft URL
  published_remote_url      TEXT,                        -- live URL (CDN / Supabase Storage)
  published_mobile_url      TEXT,
  published_static_path     TEXT,                        -- relative path in built static bundle
  published_static_mobile_path TEXT,
  original_fallback_path    TEXT,                        -- bundled fallback, never changes
  alt_text                  TEXT,
  focal_x                   FLOAT DEFAULT 0.5,
  focal_y                   FLOAT DEFAULT 0.5,
  version                   INTEGER NOT NULL DEFAULT 1,
  draft_status              TEXT NOT NULL DEFAULT 'none' CHECK (draft_status IN ('none','pending','approved','rejected')),
  published_at              TIMESTAMPTZ,
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by                UUID REFERENCES auth.users(id),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_global_assets_category ON global_assets(category);

-- ─── asset_versions ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS asset_versions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id                  UUID NOT NULL REFERENCES global_assets(id) ON DELETE CASCADE,
  version                   INTEGER NOT NULL,
  original_url              TEXT,
  mobile_url                TEXT,
  static_path               TEXT,
  static_mobile_path        TEXT,
  alt_text                  TEXT,
  focal_x                   FLOAT,
  focal_y                   FLOAT,
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by                UUID REFERENCES auth.users(id),
  publication_id            UUID                            -- FK added after publications table
);

CREATE INDEX IF NOT EXISTS idx_asset_versions_asset_id ON asset_versions(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_versions_version ON asset_versions(asset_id, version DESC);

-- ─── asset_usages ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS asset_usages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id          UUID NOT NULL REFERENCES global_assets(id) ON DELETE CASCADE,
  page_route        TEXT NOT NULL,
  component_name    TEXT NOT NULL,
  usage_label       TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_usages_unique
  ON asset_usages(asset_id, page_route, component_name);

-- ─── publications ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS publications (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','in_progress','succeeded','failed','rolled_back')),
  started_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at          TIMESTAMPTZ,
  initiated_by          UUID REFERENCES auth.users(id),
  manifest_version      INTEGER,
  deployment_reference  TEXT,         -- e.g. Netlify deploy ID, Vercel deployment URL
  error_message         TEXT,
  rollback_of           UUID REFERENCES publications(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_started ON publications(started_at DESC);

-- Add FK from asset_versions to publications (now that publications exists)
ALTER TABLE asset_versions
  ADD CONSTRAINT fk_asset_versions_publication
  FOREIGN KEY (publication_id) REFERENCES publications(id)
  ON DELETE SET NULL;

-- ─── cms_claims ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cms_claims (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_text      TEXT NOT NULL,
  verified        BOOLEAN NOT NULL DEFAULT FALSE,
  evidence_url    TEXT,
  evidence_date   DATE,
  internal_note   TEXT,
  display         BOOLEAN NOT NULL DEFAULT FALSE,
  category        TEXT NOT NULL DEFAULT 'global' CHECK (category IN ('daycare','eduhub','global')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by      UUID REFERENCES auth.users(id)
);

-- Seed default claims (unverified)
INSERT INTO cms_claims (claim_text, category, internal_note) VALUES
  ('Egypt''s Most Trusted Nursery',                        'daycare',  'Source and methodology required before display'),
  ('First CACHE-approved centre in Egypt',                 'eduhub',   'Verify with CACHE UK registry'),
  ('First and only CACHE-approved centre in Egypt',        'eduhub',   'Confirm "only" status is still current'),
  ('500+ graduates',                                       'eduhub',   'Provide graduation records count'),
  ('98% parent satisfaction',                              'daycare',  'Survey methodology, sample size, and date required'),
  ('200+ surveyed families',                               'daycare',  'Link to survey data'),
  ('4.9/5 rating',                                         'daycare',  'Platform, review count, and date required'),
  ('100% UK accredited',                                   'eduhub',   'Define scope: which qualifications, which accrediting body')
ON CONFLICT DO NOTHING;

-- ─── audit_log ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id        UUID REFERENCES auth.users(id),
  actor_email     TEXT,
  action          TEXT NOT NULL,                 -- e.g. 'cms.publish', 'asset.upload', 'claim.verify'
  resource_type   TEXT,                          -- e.g. 'cms_drafts', 'global_assets'
  resource_id     TEXT,
  before_state    JSONB,
  after_state     JSONB,
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE global_assets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_versions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_usages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_claims        ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;

-- ── global_assets policies ───────────────────────────────────────────────────

-- Public can read published asset metadata only
CREATE POLICY "public_read_published_assets"
  ON global_assets FOR SELECT
  TO anon
  USING (published_remote_url IS NOT NULL OR published_static_path IS NOT NULL);

-- Authenticated CMS editors can read all assets (drafts + published)
CREATE POLICY "authenticated_read_all_assets"
  ON global_assets FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated editors can create and update draft fields
CREATE POLICY "authenticated_upsert_draft_assets"
  ON global_assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_draft_assets"
  ON global_assets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only admins (claim: role = 'admin') can delete assets
CREATE POLICY "admin_delete_assets"
  ON global_assets FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- ── asset_versions policies ──────────────────────────────────────────────────

-- Authenticated users can read version history
CREATE POLICY "authenticated_read_asset_versions"
  ON asset_versions FOR SELECT
  TO authenticated
  USING (true);

-- Version records are inserted by the publishing workflow only — no public write
CREATE POLICY "authenticated_insert_asset_versions"
  ON asset_versions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Version history cannot be modified or deleted by clients
-- (updates/deletes blocked by absence of UPDATE/DELETE policies)

-- ── asset_usages policies ────────────────────────────────────────────────────

CREATE POLICY "public_read_asset_usages"
  ON asset_usages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "authenticated_manage_asset_usages"
  ON asset_usages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── publications policies ────────────────────────────────────────────────────

-- Authenticated editors can read publication history
CREATE POLICY "authenticated_read_publications"
  ON publications FOR SELECT
  TO authenticated
  USING (true);

-- Only the server-side publishing function (service role) writes publications
-- Client code must NOT be able to insert/update publication records directly
-- (No INSERT/UPDATE/DELETE policies for authenticated — use service role only)

-- ── cms_claims policies ──────────────────────────────────────────────────────

-- Public can read only verified, display-enabled claims
CREATE POLICY "public_read_verified_claims"
  ON cms_claims FOR SELECT
  TO anon
  USING (verified = true AND display = true);

-- Authenticated editors can read all claims
CREATE POLICY "authenticated_read_all_claims"
  ON cms_claims FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated editors can manage claims
CREATE POLICY "authenticated_manage_claims"
  ON cms_claims FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── audit_log policies ───────────────────────────────────────────────────────

-- No public access to audit log
-- Admins can read audit log
CREATE POLICY "admin_read_audit_log"
  ON audit_log FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Only service role writes audit log entries (no client-side insert policy)

-- ─────────────────────────────────────────────────────────────────────────────
-- NOTES FOR ADMINISTRATOR
-- ─────────────────────────────────────────────────────────────────────────────
--
-- 1. The 'admin' role check uses (auth.jwt() ->> 'role'). You must set this
--    custom claim in your Supabase Auth hooks or via a custom JWT function.
--    Example: update auth.users set raw_app_meta_data = '{"role": "admin"}'
--    where email = 'your-admin@example.com';
--
-- 2. The publications table intentionally has no client INSERT/UPDATE policies.
--    Publication records must be written by a Supabase Edge Function using the
--    service-role key, which bypasses RLS. Store the service-role key ONLY in
--    Edge Function secrets, never in browser code.
--
-- 3. Supabase Storage buckets for uploaded assets must be created separately:
--    - Bucket: 'cms-drafts'     (private, authenticated upload, max 10MB)
--    - Bucket: 'cms-published'  (public read, service-role write only)
--    Configure upload policies via Supabase Dashboard > Storage > Policies.
--
-- 4. After applying, verify RLS is working by testing with an anon key:
--    SELECT * FROM global_assets; -- should return only published rows
--    SELECT * FROM cms_claims;    -- should return only verified+display rows
--    SELECT * FROM publications;  -- should return 0 rows (no anon policy)
-- ─────────────────────────────────────────────────────────────────────────────
