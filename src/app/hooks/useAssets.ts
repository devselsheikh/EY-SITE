// ─────────────────────────────────────────────────────────────────────────────
// useAssets — legacy compatibility shim.
//
// Public image delivery now uses localImageRegistry.ts directly via ManagedImage.
// This file retains its exported API so that any remaining import sites compile,
// but it no longer queries Supabase or maintains a runtime image cache.
// ─────────────────────────────────────────────────────────────────────────────

import { getFallbackUrl, getFallbackAlt } from '../data/assetManifest';

export interface ResolvedAsset {
  publishedUrl: string;
  publishedMobileUrl: string;
  draftUrl: string;
  fallbackUrl: string;
  altText: string;
  version: number;
  focalX: number;
  focalY: number;
  isPublished: boolean;
  source: 'static-manifest' | 'supabase' | 'bundled-manifest';
}

export type AssetMap = Record<string, ResolvedAsset>;

function makeEntry(key: string): ResolvedAsset {
  const url = getFallbackUrl(key);
  return {
    publishedUrl: url,
    publishedMobileUrl: url,
    draftUrl: url,
    fallbackUrl: url,
    altText: getFallbackAlt(key),
    version: 1,
    focalX: 0.5,
    focalY: 0.5,
    isPublished: true,
    source: 'bundled-manifest',
  };
}

/** No-op: public image delivery no longer uses a runtime cache. */
export function invalidateAssetCache(): void {}

/** No-op: no subscribers needed. */
export function subscribeToAssets(_fn: (map: AssetMap) => void): () => void {
  return () => {};
}

/** Resolve a single asset to its bundled manifest fallback URL. */
export function resolveAssetUrl(key: string): string {
  return getFallbackUrl(key);
}

/** Returns a static map from the bundled asset manifest. */
export function getAssetMap(): AssetMap {
  return {};
}

/** React hook — returns an empty map; ManagedImage reads from localImageRegistry instead. */
export function useAssets(): AssetMap {
  return {};
}

/** Single-asset convenience hook — returns bundled fallback data. */
export function useAsset(key: string): ResolvedAsset & { resolvedUrl: string } {
  const entry = makeEntry(key);
  return { ...entry, resolvedUrl: entry.publishedUrl };
}
