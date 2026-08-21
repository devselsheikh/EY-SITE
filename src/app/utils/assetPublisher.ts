// ─────────────────────────────────────────────────────────────────────────────
// assetPublisher — full authenticated publication workflow.
//
// This module orchestrates the complete path from a private draft in
// cms-image-drafts to permanent public variants in cms-image-published.
//
// INVARIANTS:
//   1. No signed URL is ever written to published_remote_url or published_mobile_url.
//   2. All variant uploads must succeed before the database record is updated.
//   3. On any failure, already-uploaded variants are deleted and the previous
//      published URLs are left intact.
//   4. Callers get an exact error message for every failure mode.
//
// Published path structure in cms-image-published:
//   {asset_key}/v{version}/desktop.webp
//   {asset_key}/v{version}/mobile.webp
//   {asset_key}/v{version}/original.{ext}
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabase/client';
import {
  GlobalAssetRow,
  PUBLISHED_BUCKET,
  downloadDraftBlob,
  writePublishedRecord,
  fetchGlobalAssets,
} from '../data/cms';
import { invalidateAssetCache } from '../hooks/useAssets';
import {
  generateVariants,
  loadImageFromBlob,
} from './imageProcessing';

// ─── Asset status ─────────────────────────────────────────────────────────────

export type AssetStatus =
  | 'fallback-only'
  | 'draft-saved'
  | 'approved-remotely'
  | 'included-in-package'
  | 'statically-deployed';

// Session-level set of asset keys that were in the last generated publication package
const _includedInPackage = new Set<string>();

export function markIncludedInPackage(assetKeys: string[]): void {
  _includedInPackage.clear();
  assetKeys.forEach(k => _includedInPackage.add(k));
}

export function getAssetStatus(row: GlobalAssetRow | null): AssetStatus {
  if (!row) return 'fallback-only';
  if (row.published_static_path) return 'statically-deployed';
  if (_includedInPackage.has(row.asset_key)) return 'included-in-package';
  if (row.published_remote_url) return 'approved-remotely';
  if (row.draft_storage_path || row.draft_original_url) return 'draft-saved';
  return 'fallback-only';
}

// ─── Progress reporting ───────────────────────────────────────────────────────

export type PublishStep =
  | 'fetching-asset'
  | 'downloading-draft'
  | 'generating-desktop'
  | 'generating-mobile'
  | 'uploading-desktop'
  | 'uploading-mobile'
  | 'uploading-original'
  | 'saving-record'
  | 'inserting-version'
  | 'done';

export type PublishProgress = {
  step: PublishStep;
  label: string;
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function uploadVariant(
  blob: Blob,
  path: string,
  contentType: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.storage.from(PUBLISHED_BUCKET).upload(
    path,
    blob,
    { upsert: true, contentType, cacheControl: '31536000' },
  );
  return { error: error?.message ?? null };
}

function getPublicUrl(path: string): string {
  return supabase.storage.from(PUBLISHED_BUCKET).getPublicUrl(path).data.publicUrl;
}

async function cleanupPaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  await supabase.storage.from(PUBLISHED_BUCKET).remove(paths).catch(() => {});
}

// ─── Single-asset publication ─────────────────────────────────────────────────

/**
 * Full publication workflow for one asset key.
 *
 * Steps:
 *   1. Fetch the asset row (needs draft source + focal point + version).
 *   2. Acquire the draft image as a Blob:
 *        - If draft_storage_path is set: download from cms-image-drafts.
 *        - If draft_original_url is set: fetch from the external URL.
 *        - Otherwise: error — no draft to publish.
 *   3. Decode the blob into an HTMLImageElement.
 *   4. Generate desktop WebP (1400px, 4:3) and mobile WebP (800px, 1:1).
 *   5. Upload desktop.webp, mobile.webp, original.{ext} to cms-image-published.
 *   6. If all three uploads succeed:
 *        - Obtain permanent public CDN URLs (never signed URLs).
 *        - Write published_remote_url, published_mobile_url, storage paths,
 *          version, and published_at to global_assets.
 *        - Insert an asset_versions record.
 *        - Invalidate the useAssets cache.
 *   7. If any upload or DB operation fails:
 *        - Delete any partially-uploaded variants.
 *        - Leave the previous published URLs untouched.
 *        - Return the exact error message.
 */
export async function approveAssetForPublication(
  assetKey: string,
  onProgress?: (p: PublishProgress) => void,
): Promise<{ error: string | null }> {
  const report = (step: PublishStep, label: string) => onProgress?.({ step, label });

  // ── 1. Fetch asset row ────────────────────────────────────────────────────
  report('fetching-asset', 'Fetching asset record…');
  const { data: rowData, error: fetchErr } = await supabase
    .from('global_assets')
    .select('*')
    .eq('asset_key', assetKey)
    .single();

  if (fetchErr || !rowData) {
    return { error: `Asset not found: ${fetchErr?.message ?? 'unknown error'}` };
  }
  const row = rowData as GlobalAssetRow;

  if (!row.alt_text?.trim()) {
    return { error: 'Alt text is required before approving for publication. Add a description and save the draft first.' };
  }

  const focalX = row.focal_x ?? 0.5;
  const focalY = row.focal_y ?? 0.5;
  const newVersion = (row.version ?? 1) + 1;

  // ── 2. Acquire source blob ────────────────────────────────────────────────
  let sourceBlob: Blob;
  let originalExt = 'jpg';

  if (row.draft_storage_path) {
    report('downloading-draft', 'Downloading draft from private storage…');
    const { blob, error: dlErr } = await downloadDraftBlob(row.draft_storage_path);
    if (dlErr || !blob) {
      return { error: `Failed to download draft from storage: ${dlErr ?? 'unknown error'}` };
    }
    sourceBlob = blob;
    originalExt = row.draft_storage_path.split('.').pop()?.toLowerCase() ?? 'jpg';
  } else if (row.draft_original_url) {
    report('downloading-draft', 'Fetching draft from external URL…');
    try {
      const res = await fetch(row.draft_original_url, {
        mode: 'cors',
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      sourceBlob = await res.blob();
      const urlPath = new URL(row.draft_original_url).pathname;
      originalExt = urlPath.split('.').pop()?.toLowerCase() ?? 'jpg';
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        error: `Could not fetch external draft URL: ${msg}. ` +
          `Upload the file directly to storage (drag-and-drop in the editor) and try again.`,
      };
    }
  } else {
    return { error: 'No draft found. Upload a file or paste an image URL, then save the draft first.' };
  }

  // ── 3. Decode image ────────────────────────────────────────────────────────
  let img: HTMLImageElement;
  try {
    img = await loadImageFromBlob(sourceBlob);
  } catch (e: unknown) {
    return { error: `Could not decode the draft image: ${e instanceof Error ? e.message : String(e)}` };
  }

  // ── 4. Generate variants ───────────────────────────────────────────────────
  report('generating-desktop', 'Generating desktop WebP (1400px, 4:3)…');
  let variants: Awaited<ReturnType<typeof generateVariants>>;
  try {
    variants = await generateVariants(img, focalX, focalY);
  } catch (e: unknown) {
    return { error: `Variant generation failed: ${e instanceof Error ? e.message : String(e)}` };
  }

  const desktopWebP = variants.find(v => v.label === 'desktop' && v.format === 'webp');
  const mobileWebP  = variants.find(v => v.label === 'mobile'  && v.format === 'webp');

  if (!desktopWebP || !mobileWebP) {
    return { error: 'WebP variant generation returned no output. Check browser support.' };
  }

  // ── 5. Upload all variants (must all succeed) ──────────────────────────────
  const desktopPath  = `${assetKey}/v${newVersion}/desktop.webp`;
  const mobilePath   = `${assetKey}/v${newVersion}/mobile.webp`;
  const originalPath = `${assetKey}/v${newVersion}/original.${originalExt}`;

  const uploadedPaths: string[] = [];

  report('uploading-desktop', 'Uploading desktop variant to cms-image-published…');
  const { error: desktopErr } = await uploadVariant(desktopWebP.blob, desktopPath, 'image/webp');
  if (desktopErr) {
    return { error: `Desktop upload failed: ${desktopErr}` };
  }
  uploadedPaths.push(desktopPath);

  report('uploading-mobile', 'Uploading mobile variant…');
  const { error: mobileErr } = await uploadVariant(mobileWebP.blob, mobilePath, 'image/webp');
  if (mobileErr) {
    await cleanupPaths(uploadedPaths);
    return { error: `Mobile upload failed: ${mobileErr}` };
  }
  uploadedPaths.push(mobilePath);

  report('uploading-original', 'Uploading original file…');
  const origMime = sourceBlob.type || `image/${originalExt === 'jpg' ? 'jpeg' : originalExt}`;
  const { error: origErr } = await uploadVariant(sourceBlob, originalPath, origMime);
  if (origErr) {
    await cleanupPaths(uploadedPaths);
    return { error: `Original file upload failed: ${origErr}` };
  }
  uploadedPaths.push(originalPath);

  // ── 6. Obtain permanent public CDN URLs ────────────────────────────────────
  const desktopPublicUrl = getPublicUrl(desktopPath);
  const mobilePublicUrl  = getPublicUrl(mobilePath);

  // ── 7. Write database record ───────────────────────────────────────────────
  report('saving-record', 'Writing published record to database…');
  const { error: dbErr, assetId } = await writePublishedRecord(assetKey, {
    published_remote_url: desktopPublicUrl,
    published_mobile_url: mobilePublicUrl,
    published_storage_path: desktopPath,
    published_mobile_storage_path: mobilePath,
    original_published_storage_path: originalPath,
    version: newVersion,
    alt_text: row.alt_text,
    focal_x: focalX,
    focal_y: focalY,
  });

  if (dbErr) {
    // DB update failed — remove what we just uploaded to avoid orphaned files
    await cleanupPaths(uploadedPaths);
    return { error: `Database write failed: ${dbErr}` };
  }

  // ── 8. Insert version record (non-fatal; 8s timeout guard) ──────────────────
  report('inserting-version', 'Recording version history…');
  if (assetId) {
    const timeout = new Promise<void>(resolve => setTimeout(resolve, 8_000));
    const insert = supabase.from('asset_versions').insert({
      asset_id: assetId,
      version: newVersion,
      original_url: desktopPublicUrl,
      mobile_url: mobilePublicUrl,
      alt_text: row.alt_text,
      focal_x: focalX,
      focal_y: focalY,
      created_at: new Date().toISOString(),
    }).then(() => {}).catch((e: unknown) => {
      console.debug('[CMS Publish] asset_versions insert skipped:', e instanceof Error ? e.message : String(e));
    });
    await Promise.race([insert, timeout]);
  }

  // ── 9. Invalidate cache so ManagedImage components pick up new URLs ────────
  invalidateAssetCache();

  report('done', 'Published successfully.');
  return { error: null };
}

// ─── Batch approve all URL-based drafts ───────────────────────────────────────

/**
 * Approve all assets that have a storage-backed draft (draft_storage_path).
 * Processes sequentially; returns first error encountered or null.
 */
export async function approveAllStorageDrafts(
  onProgress?: (assetKey: string, p: PublishProgress) => void,
): Promise<{ errors: Array<{ assetKey: string; error: string }> }> {
  const rows = await fetchGlobalAssets();
  const withStorageDraft = rows.filter(r => r.draft_storage_path && !r.published_remote_url);
  const errors: Array<{ assetKey: string; error: string }> = [];

  for (const row of withStorageDraft) {
    const { error } = await approveAssetForPublication(
      row.asset_key,
      p => onProgress?.(row.asset_key, p),
    );
    if (error) errors.push({ assetKey: row.asset_key, error });
  }

  return { errors };
}
