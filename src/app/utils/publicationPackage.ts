// ─────────────────────────────────────────────────────────────────────────────
// Publication Package generator
//
// Since this environment cannot programmatically trigger a Figma Make build
// or commit files to a deployment repository, this generates a downloadable
// ZIP that an administrator can use to manually update the static asset bundle.
//
// Contents:
//   asset-manifest.json       — full manifest of all published assets
//   assets/<key>/             — WebP + JPEG variants for each processed asset
//   README.txt                — deployment instructions
//   migration-metadata.json   — version tracking data
// ─────────────────────────────────────────────────────────────────────────────

import JSZip from 'jszip';
import type { GlobalAssetRow } from '../data/cms';
import type { AssetEntry } from '../data/assetManifest';
import { ASSET_MANIFEST } from '../data/assetManifest';
import { loadImageFromUrl, generateVariants, ProcessedVariant } from './imageProcessing';

export interface AssetManifestEntry {
  key: string;
  display_name: string;
  category: string;
  published_url: string | null;
  published_mobile_url?: string | null;
  published_static_path?: string | null;
  published_static_mobile_path?: string | null;
  fallback_url: string;
  alt_text: string;
  focal_x: number;
  focal_y: number;
  version: number;
  published_at: string | null;
}

export interface StaticAssetManifest {
  manifest_version: number;
  generated_at: string;
  generator: string;
  assets: Record<string, AssetManifestEntry>;
}

// ─── Build manifest from Supabase rows + static manifest ─────────────────────

export function buildStaticManifest(
  supabaseRows: GlobalAssetRow[],
  version: number,
): StaticAssetManifest {
  const rowMap = new Map(supabaseRows.map(r => [r.asset_key, r]));
  const assets: Record<string, AssetManifestEntry> = {};

  for (const [key, entry] of Object.entries(ASSET_MANIFEST)) {
    const row = rowMap.get(key);
    assets[key] = {
      key,
      display_name: row?.display_name ?? entry.name,
      category: row?.category ?? entry.category,
      published_url: row?.published_remote_url ?? entry.fallbackUrl,
      published_mobile_url: row?.published_mobile_url ?? null,
      published_static_path: row?.published_static_path ?? null,
      published_static_mobile_path: row?.published_static_mobile_path ?? null,
      fallback_url: row?.original_fallback_path ?? entry.fallbackUrl,
      alt_text: row?.alt_text ?? entry.alt,
      focal_x: row?.focal_x ?? 0.5,
      focal_y: row?.focal_y ?? 0.5,
      version: row?.version ?? 1,
      published_at: row?.published_at ?? null,
    };
  }

  return {
    manifest_version: version,
    generated_at: new Date().toISOString(),
    generator: 'Early Years CMS — Generate Publication Package',
    assets,
  };
}

// ─── Attempt to fetch an image as Blob (respects CORS) ───────────────────────

async function tryFetchImageBlob(url: string): Promise<Blob | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { mode: 'cors', signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    return blob;
  } catch {
    return null;
  }
}

// ─── Generate and download the ZIP ───────────────────────────────────────────

export type PackageProgress = {
  step: string;
  current: number;
  total: number;
};

export async function generatePublicationPackage(
  supabaseRows: GlobalAssetRow[],
  onProgress?: (p: PackageProgress) => void,
): Promise<void> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const rootFolder = `publication-package-${timestamp}`;

  const manifestVersion = Math.max(...supabaseRows.map(r => r.version ?? 1), 1) + 1;
  const manifest = buildStaticManifest(supabaseRows, manifestVersion);

  // ── README ──────────────────────────────────────────────────────────────────

  const readme = `EARLY YEARS CMS — PUBLICATION PACKAGE
Generated: ${new Date().toLocaleString()}
Manifest version: ${manifestVersion}

═══════════════════════════════════════════════════════════
WHAT THIS PACKAGE CONTAINS
═══════════════════════════════════════════════════════════

  asset-manifest.json          Full manifest of all published image assets
  assets/<key>/                WebP and JPEG variants for each processed asset
  migration-metadata.json      Version tracking and rollback metadata

═══════════════════════════════════════════════════════════
HOW TO DEPLOY
═══════════════════════════════════════════════════════════

This environment (Figma Make) does not support programmatic deployment.
To deploy this package manually:

1. Extract the ZIP to your local machine.

2. Copy asset-manifest.json to your project's /public/ directory,
   replacing the existing asset-manifest.json.

3. Copy the contents of the assets/ folder to /public/assets/published/
   in your project, replacing older versions.

4. Commit both file changes to your deployment repository.

5. Trigger a production build and deployment via your hosting provider
   (Netlify / Vercel / AWS Amplify).

6. After deployment succeeds, verify the live site is displaying the
   updated images at each usage location listed in asset-manifest.json.

7. Mark the publication as complete in the CMS Publications log.

═══════════════════════════════════════════════════════════
ROLLBACK PROCEDURE
═══════════════════════════════════════════════════════════

The previous publication package (if retained) contains the
asset-manifest.json and /assets/ files from the prior deployment.
To roll back, re-deploy the previous package following the steps above.

═══════════════════════════════════════════════════════════
SECURITY NOTES
═══════════════════════════════════════════════════════════

- No Supabase service-role key or deployment credentials are included
  in this package or in the frontend bundle.
- Supabase Storage signed URLs in this package expire after 1 hour.
- Published static assets must be deployed to a CDN or static host.
- Do not commit Supabase secrets to your deployment repository.
`;

  zip.file(`${rootFolder}/README.txt`, readme);
  zip.file(`${rootFolder}/asset-manifest.json`, JSON.stringify(manifest, null, 2));
  zip.file(`${rootFolder}/migration-metadata.json`, JSON.stringify({
    manifest_version: manifestVersion,
    generated_at: manifest.generated_at,
    asset_count: Object.keys(manifest.assets).length,
    supabase_rows: supabaseRows.length,
    assets_with_published_url: supabaseRows.filter(r => r.published_remote_url).length,
  }, null, 2));

  const assetsFolder = zip.folder(`${rootFolder}/assets`);

  // ── Process each published asset ────────────────────────────────────────────

  const publishedRows = supabaseRows.filter(r => r.published_remote_url);
  const total = publishedRows.length;
  let current = 0;

  for (const row of publishedRows) {
    current++;
    onProgress?.({ step: `Processing ${row.display_name ?? row.asset_key}`, current, total });

    const staticEntry = ASSET_MANIFEST[row.asset_key];
    const focalX = row.focal_x ?? 0.5;
    const focalY = row.focal_y ?? 0.5;
    const safeKey = row.asset_key.replace(/\./g, '-');
    const assetFolder = assetsFolder?.folder(safeKey);
    if (!assetFolder) continue;

    // Try to fetch the published image
    const blob = await tryFetchImageBlob(row.published_remote_url!);

    if (blob) {
      try {
        const img = await loadImageFromUrl(row.published_remote_url!);
        const variants = await generateVariants(img, focalX, focalY);

        for (const variant of variants) {
          const ext = variant.format === 'jpeg' ? 'jpg' : variant.format;
          const filename = `v${row.version}-${variant.label}.${ext}`;
          assetFolder.file(filename, variant.blob);
        }

        // Update manifest with local static paths
        manifest.assets[row.asset_key].published_static_path = `assets/published/${safeKey}/v${row.version}-desktop.webp`;
        manifest.assets[row.asset_key].published_static_mobile_path = `assets/published/${safeKey}/v${row.version}-mobile.webp`;
      } catch {
        assetFolder.file('FETCH_FAILED.txt', `Could not process image for ${row.asset_key}.\nURL: ${row.published_remote_url}\nPlease manually copy the image to this folder and rename it to:\n  v${row.version}-desktop.webp\n  v${row.version}-mobile.webp`);
      }
    } else {
      // Could not fetch (CORS or network error) — include instructions
      const fallbackUrl = staticEntry?.fallbackUrl ?? row.original_fallback_path ?? '';
      assetFolder.file('FETCH_FAILED.txt',
        `Could not automatically fetch this image (CORS or network timeout).\n` +
        `Published URL: ${row.published_remote_url}\n` +
        `Fallback URL:  ${fallbackUrl}\n\n` +
        `Manual step: Download the image from the URL above and save it as:\n` +
        `  v${row.version}-desktop.webp  (1400px wide, 4:3 crop)\n` +
        `  v${row.version}-mobile.webp   (800px wide, 1:1 crop)\n` +
        `Then copy both files to this folder before deploying.`
      );
    }
  }

  // Re-write manifest with updated static paths
  zip.file(`${rootFolder}/asset-manifest.json`, JSON.stringify(manifest, null, 2));

  // ── Generate and download ZIP ────────────────────────────────────────────────

  onProgress?.({ step: 'Compressing package…', current: total, total });
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${rootFolder}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
